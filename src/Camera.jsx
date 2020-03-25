import { h, render, Component } from 'preact';
import classNames from 'classnames';
import { getOrientation, fixOrientation, isSamsungBrowser } from './helpers/utils';
import './Camera.scss'

import femaleFrontContour from './images/female-front-contour.svg';
import femaleSideContour from './images/female-side-contour.svg';
import maleFrontContour from './images/male-front-contour.svg';
import maleSideContour from './images/male-side-contour.svg';
import warning from './images/camera-warning.svg';

const VIDEO_CONFIG = {
  video: {
    facingMode: { exact: 'environment' },
    width: { exact: 1280 },
  },
  audio: false,
};

// // for development to open on desktop
// let VIDEO_CONFIG = {
//   'audio': false,
//   'video': {
//     facingMode: 'environment', //'user'
//   }
// };

class Camera extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      allowed: true,
      gyroscope: false,
      cameras: [],
      activeCamera: -1
    };

    this.rotX = 0;
    this.rotY = 0;
  }

  is(platform) {
    const ua = navigator.userAgent;

    if (platform === 'iOS') {
      return ua.includes('iPhone') || ua.includes('Mac OS');
    }

    if (platform === 'Android') {
      return ua.includes('Android') || ua.includes('Linux');
    }

    return false;
  }

  startStream = async () => {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONFIG);
      this.video.srcObject = this.stream;

      this.getUserDevices();
    } catch (error) {
      this.setState({
        allowed: false,
      });
      alert('Oops!\nGet fitted requires access to the camera to allow you to make photos that are required to calculate your body measurements. Please reopen widget and try again.');
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }
  };

  getUserDevices = () => {
    navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const devicesArr = [];

          devices.forEach((e, i)=>{
            if (e.kind === 'videoinput' && e.label.includes('back')) {
              devicesArr.push(e.deviceId)
            }
          });

          if (devicesArr.length > 1) {
            this.setState({
              cameras: devicesArr,
            })
          }
        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        });
  }

  takePhoto = async () => {
    try {
      const settings = this.stream.getVideoTracks()[0].getSettings();
      // alert(JSON.stringify(settings));
      const canvas = document.createElement('canvas');
      // kostil incoming
      if (isSamsungBrowser()) {
        canvas.width = settings.height;
        canvas.height = settings.width;
      } else {
        canvas.width = settings.width;
        canvas.height = settings.height;
      }
      canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height);
      this.setState({ processing: true }, () => canvas.toBlob(this.setPhoto));
    } catch (exception) {
      alert(`Error: ${exception}`);
    }
  };

  setPhoto = async (blob) => {
    try {
      const { change = 'front' } = this.props;
      const image = await fixOrientation(blob, await getOrientation(blob));
      this.stream.getVideoTracks()[0].stop();
      this.setState({ processing: false });
      change(image);
    } catch (exception) {
      alert(`Error: ${exception}`);
    }
  }

  retryPhoto = () => {
    const { imgURI } = this.state;

    if (imgURI) {
      this.setState({ imgURI: null, processing: false }, this.startStream);
    }
  }

  before(component) {
    const { imgURI, processing } = this.state;
    if (imgURI || processing) {
      return;
    }

    return component;
  }

  after = (component) => {
    const { imgURI, processing } = this.state;

    if (!imgURI || processing) {
      return;
    }

    return component;
  };

  processing = (component) => {
    const { processing } = this.state;

    if (!processing) {
      return;
    }

    return component;
  };

  componentDidMount() {
    window.addEventListener('devicemotion', (event) => {
      if(event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma) {
        this.setState({
          gyroscope: true,
        })
      }
    }, {once: true});

    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    }, this.startStream);

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === 'granted') {
              window.ondeviceorientation = this.orientation;
            }
          })
          .catch(console.error);
    } else {
      window.ondeviceorientation = this.orientation;
    }
  }

  orientation = (event) => {
    const { beta, gamma } = event;

    setTimeout(() => {
      this.normalizeData(gamma, beta);
    }, 50);
  };

  normalizeData = (_g, _b) => {
    this.b = Math.round(_b);
    this.g = Math.round(_g);

    this.rotY += (this.g - this.rotY) / 5;
    this.rotX += (this.b - this.rotX) / 5;

    if (this.b < 75 || this.b > 105) {
      this.setState({ info: true });
    } else {
      this.setState({ info: false });
    }
  };

  changeCamera = async (e) => {
     const { cameras } = this.state;
     const { id } = e.target.dataset;

     await this.stream.getTracks().forEach(track => track.stop())

     this.setState({
       activeCamera: id
     })

     const videoConfig = { video: { deviceId: cameras[id] } };

     try {
       this.stream = await navigator.mediaDevices.getUserMedia(videoConfig);
       this.video.srcObject = this.stream;
     } catch (error) {
       this.setState({
         allowed: false,
       });
       alert('Oops!\nGet fitted requires access to the camera to allow you to make photos that are required to calculate your body measurements. Please reopen widget and try again.');
     }
  }

  render() {
    const {
      info,
      processing,
      allowed,
      gyroscope,
      cameras,
      activeCamera
    } = this.state;

    const {
      type = 'front',
      gender = 'female',
    } = this.props;

    return (
        <div className={classNames('widget-camera')} ref={this.initCamera}>
          {this.before(
              <div className="widget-camera__video-wrapper">
                <video
                    crossOrigin="anonymous"
                    controls={false}
                    controlsList={false}
                    muted
                    ref={(ref) => this.video = ref}
                    playsinline
                    autoPlay
                    className={classNames('widget-camera-video')}
                />
                {(type === 'front' && gender === 'female') ? <img className="widget-camera__contour" src={femaleFrontContour} alt="front contour" /> : null }
                {(type === 'side' && gender === 'female') ? <img className="widget-camera__contour" src={femaleSideContour} alt="side contour" /> : null }
                {(type === 'front' && gender === 'male') ? <img className="widget-camera__contour" src={maleFrontContour} alt="front contour" /> : null }
                {(type === 'side' && gender === 'male') ? <img className="widget-camera__contour" src={maleSideContour} alt="side contour" /> : null }
              </div>
          )}

          {this.processing(
              <p className={classNames('widget-camera-processing')}>Processing...</p>
          )}

          {cameras ? (
              <ul className='widget-camera__cameras'>
                {cameras.map((e, i) => (
                    <li className={classNames('widget-camera__cameras-btn-wrap', { 'widget-camera__cameras-btn-wrap--active': +i === +activeCamera })}>
                      <button
                        data-id={i}
                        onClick={this.changeCamera}
                        className='widget-camera__cameras-btn'
                      >
                        {i+1}
                      </button>
                    </li>
                ))}
              </ul>
          ) : null}

          <div className={classNames('widget-camera-controls')}>
            {this.before(!processing
                && (
                    <button className={classNames('widget-camera-take-photo')} onClick={this.takePhoto} type="button" disabled={!allowed}>
                      <div className={classNames('widget-camera-take-photo-effect')} />
                    </button>
                ))}
          </div>

          <div className={classNames('widget-camera__warning', {
            active: info && gyroscope,
          })}>
            <img src={warning} alt="warning" />
            {/*<button type='button' onMouseDown={this.handleClick}>flip button</button>*/}
            <h2>Hold the phone vertically</h2>
          </div>
        </div>
    );
  }
}

process.env.NODE_ENV === 'production' || render(<Camera />, document.body);

export default Camera;
