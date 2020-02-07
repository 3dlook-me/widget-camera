import { h, render, Component } from 'preact';
import classNames from 'classnames';
import { getOrientation, fixOrientation, isSamsungBrowser } from './helpers/utils';
import './Camera.scss'

import frontContour from './images/front-contour.svg';

// const frontContour = require('./images/front-contour.svg');
const sideContour = require('./images/side-contour.svg');
const warning = require('./images/camera-warning.svg');

const VIDEO_CONFIG = {
  video: {
    facingMode: { exact: 'environment' },
    width: { exact: 1280 },
  },
  audio: false,
};

class Camera extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      allowed: true,
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
    } catch (error) {
      this.setState({
        allowed: false,
      });
      alert('Oops!\nGet fitted requires access to the camera to allow you to make photos that are required to calculate your body measurements. Please reopen widget and try again.');
    }
  };

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

  render() {
    const {
      info,
      processing,
      allowed,
    } = this.state;

    const {
      type = 'front',
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
                {(type === 'front') ? <img className="widget-camera__contour" src={frontContour} alt="front contour" /> : null }
                {(type === 'side') ? <img className="widget-camera__contour" src={sideContour} alt="side contour" /> : null }
              </div>
          )}

          {this.processing(
              <p className={classNames('widget-camera-processing')}>Processing...</p>
          )}

          <div className={classNames('widget-camera-controls')}>

            {this.before(!processing
                && (
                    <button className={classNames('widget-camera-take-photo')} onClick={this.takePhoto} type="button" disabled={!allowed}>
                      <div className={classNames('widget-camera-take-photo-effect')} />
                    </button>
                ))}
          </div>

          {(info) ? (
              <div className="widget-camera__warning">
                <img src={warning} alt="warning" />
                <h2>Hold the phone vertically</h2>
              </div>
          ) : null}
        </div>
    );
  }

}
process.env.NODE_ENV === 'production' || render(<Camera />, document.body);

export default Camera;
