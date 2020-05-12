import { h, render, Component } from 'preact';
import classNames from 'classnames';
import { getOrientation, fixOrientation, isSamsungBrowser } from './helpers/utils';
import './Camera.scss';

import warning from './images/camera-warning.svg';
import grade from './images/grade.svg';
import pointer from './images/pointer.svg';

const VIDEO_CONFIG = {
  audio: false,
  video: {
    facingMode: 'environment', // 'user'
    width: { exact: 1280 },
  },
};

class Camera extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      gyroscope: false,
      camerasBack: [],
      activeCamera: -1,
      gyroscopePosition: 180,
    };

    this.rotX = 0;
    this.rotY = 0;
  }

  componentDidMount() {
    window.addEventListener('devicemotion', (event) => {
      if (event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma) {
        this.setState({
          gyroscope: true,
        });
      }
    }, { once: true });

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

  // tap at the bottom of the screen to allow gyroscope for iphone in dev mode
  iphoneGyroStart = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.ondeviceorientation = this.orientation;
          }

          this.setState({
            gyroscope: true,
          });
        })
        .catch(console.error);
    } else {
      window.ondeviceorientation = this.orientation;
    }
  }

  startStream = async () => {
    this.startCamera(VIDEO_CONFIG, this.getUserDevices);
  };

  startCamera = async (config, callback) => {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(config);

      this.video.srcObject = this.stream;

      if (callback) {
        callback().catch((err) => console.err(err));
      }
    } catch (error) {
      if (this.is('Android')) {
        const cameras = await this.additionalCamerasCheck();
        const isAvailableCameras = await this.camerasFilter(cameras);

        if (isAvailableCameras) return;
      }

      alert('Oops!\nGet fitted requires access to the camera to allow you to make photos that are required to calculate your body measurements. Please reopen widget and try again.');

      window.location.reload();
    }
  }

  getUserDevices = () => navigator.mediaDevices.enumerateDevices()
    .then(async (devices) => {
      const devicesBackArr = [];

      devices.forEach((e, i) => {
        if (e.kind === 'videoinput' && e.label.includes('back')) {
          devicesBackArr.push(e.deviceId);
        }
      });

      // for android (start stream from camera by id)
      if (this.is('Android')) {
        this.androidCameraStart(devicesBackArr);

        return Promise.resolve();
      }

      // for other (start stream from default camera)
      if (devicesBackArr.length > 1) {
        this.setState({
          camerasBack: devicesBackArr,
        });
      }
    })

  additionalCamerasCheck = () => navigator.mediaDevices.enumerateDevices()
    .then(async (devices) => {
      const devicesBackArr = [];

      devices.forEach((e, i) => {
        if (e.kind === 'videoinput' && e.label.includes('back')) {
          devicesBackArr.push(e.deviceId);
        }
      });

      return devicesBackArr;
    })

  androidCameraStart = async (cameras) => {
    this.setState({
      camerasBack: cameras,
      activeCamera: 0,
    });

    const videoConfig = {
      video: {
        deviceId: cameras[0],
        width: { exact: 1280 },
      },
      audio: false,
    };

    await this.stream.getTracks().forEach((track) => track.stop());

    this.startCamera(videoConfig);
  }

  changeCamera = async (e) => {
    const { camerasBack } = this.state;
    const { id } = e.target.dataset;
    const videoConfig = {
      video: {
        deviceId: camerasBack[id],
        width: { exact: 1280 },
      },
      audio: false,
    };

    await this.stream.getTracks().forEach((track) => track.stop());

    this.setState({
      activeCamera: id,
    });

    this.startCamera(videoConfig);
  }

  camerasFilter = async (camerasBack) => {
    const filteredCameras = [];
    let isCameraAllowed = false;

    // check for case if the camera is unavailable
    for (let i = 0; i < camerasBack.length; i++) {
      const videoConfig = {
        video: {
          deviceId: camerasBack[i],
          width: { exact: 1280 },
        },
        audio: false,
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia(videoConfig);

        filteredCameras.push(camerasBack[i]);

        isCameraAllowed = true;
      } catch (error) {
        console.error(error);
      }
    }

    if (isCameraAllowed) {
      this.setState({
        camerasBack: filteredCameras,
        activeCamera: 0,
      });

      this.stream.getTracks().forEach((track) => track.stop());

      const videoConfig = {
        video: {
          deviceId: filteredCameras[0],
          width: { exact: 1280 },
        },
        audio: false,
      };

      this.startCamera(videoConfig);

      return true;
    }

    return false;
  }

  orientation = (event) => {
    const { beta, gamma } = event;

    setTimeout(() => {
      this.gyroscopePointerPosition(beta);
      this.normalizeData(gamma, beta);
    }, 50);
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

  gyroscopePointerPosition = (value) => {
    const result = (value * 360) / 180;
    let position = result;

    if (result < 0) {
      position = 0;

      this.setState({
        gyroscopePosition: position,
      });

      return;
    }

    if (result > 360) {
      position = 360;

      this.setState({
        gyroscopePosition: position,
      });

      return;
    }

    this.setState({
      gyroscopePosition: position,
    });
  }

  render() {
    const {
      info,
      processing,
      gyroscope,
      camerasBack,
      activeCamera,
      gyroscopePosition,
    } = this.state;

    const { type = 'front' } = this.props;

    return (
      <div className={classNames('widget-camera')} ref={this.initCamera}>
        <div className="widget-camera__title">
          {`${type} photo`}
        </div>
        <div className="widget-camera__grade-wrap">
          <div className="widget-camera__grade-container">
            <img className="widget-camera__grade" src={grade} alt="grade" />
            <div className="widget-camera__pointer" style={{ transform: `translateY(-${gyroscopePosition}px)` }}>
              <img className="widget-camera__pointer-icon" src={pointer} alt="pointer" />
            </div>
          </div>
        </div>
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
          </div>,
        )}

        {this.processing(
          <p className={classNames('widget-camera-processing')}>Processing...</p>,
        )}

        {/* condition > 1 is for android phones ( this.androidCameraStart ) */}
        {camerasBack.length > 1 ? (
          <ul className="widget-camera__cameras">
            {camerasBack.map((e, i) => (
              <li className={classNames('widget-camera__cameras-btn-wrap', { 'widget-camera__cameras-btn-wrap--active': +i === +activeCamera })}>
                <button
                  type="button"
                  data-id={i}
                  onClick={this.changeCamera}
                  className="widget-camera__cameras-btn"
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={classNames('widget-camera-controls', {
            'widget-camera-controls--warning': info && gyroscope,
          })}
          onClick={process.env.NODE_ENV !== 'production' ? this.iphoneGyroStart : null}
        >
          {this.before(!processing
                && (
                <button className={classNames('widget-camera-take-photo')} onClick={this.takePhoto} type="button" disabled={info && gyroscope}>
                  <div className={classNames('widget-camera-take-photo-effect')} />
                </button>
                ))}
        </div>

        <div className={classNames('allow-frame', {
          'allow-frame--warning': info,
        })}
        >
          <div className="allow-frame__warning-content">
            <img className="allow-frame__warning-img" src={warning} alt="warning" />
            <h2 className="allow-frame__warning-txt">
              Hold the phone vertically
            </h2>
          </div>

          <div className="allow-frame__bottom-border">
            <div className="allow-frame__bottom-border-space" />
          </div>
        </div>
      </div>
    );
  }
}

process.env.NODE_ENV === 'production' || render(<Camera />, document.body);

export default Camera;
