import {
  h,
  render,
  Component,
  createRef,
} from 'preact';
import classNames from 'classnames';

import {
  getOrientation,
  fixOrientation,
  isSamsungBrowser,
} from './helpers/utils';

import './Camera.scss';
import warning from './images/camera-warning.svg';
import grade from './images/grade.svg';
import pointer from './images/pointer.svg';
import pose from './images/ic_pose.svg';
import muteIcon from './images/ic_sound.svg';

import placeYourPhone from './audio/Place_your_phone_on_a_table.mp3';
import wellDone from './audio/well_done.mp3';
import toClickReady from './audio/to_continue.mp3';
import audioStepsBackwards from './audio/take_3_to_4.mp3';
import audioHighQuality from './audio/remember.mp3';
import audioFrontInstruction from './audio/your_legs.mp3';
import audioDontMove from './audio/please_stay_camera_shutter.mp3';
import audioPhotoShutter from './audio/shutter.mp3';

const VIDEO_CONFIG = {
  audio: false,
  video: {
    facingMode: 'environment', // 'user'
    width: { exact: 1280 },
  },
};

class Camera extends Component {
  audio = createRef();

  constructor(props, context) {
    super(props, context);

    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      camerasBack: [],
      activeCamera: -1,
      gyroscopePosition: 180,
      isButtonInit: false,
      // tapScreen: props.tapScreen === 'front-mode',
      tapScreen: true,

      activeAudioTrack: placeYourPhone,
      activeAudioTrackIndex: 0,

      isGyroTimerAccess: false,
      isFrontFlowButtonDisabled: false,
      photoTimerSecs: 6,
      isPhotoTimer: false,
      isFirstAudio: true,
    };

    this.gyroTimer = null;
    this.playSpeed = 2;
    this.rotX = 0;
    this.rotY = 0;
  }

  tapToStart = () => {
    const { current } = this.audio;

    current.play();
    this.audio.current.playbackRate = this.playSpeed;

    current.addEventListener('ended', () => {
      this.setState({ isFirstAudio: false });
    }, { once: true });

    this.setState({
      tapScreen: false,
      isGyroTimerAccess: true,
      isFrontFlowButtonDisabled: true,
    });
  }

  voiceAfterSuccessGyro = () => {
    const { current } = this.audio;

    current.addEventListener('ended', () => {
      this.setState({
        activeAudioTrack: toClickReady,
        isFrontFlowButtonDisabled: false,
      });

      current.load();
      current.play();
      this.audio.current.playbackRate = this.playSpeed;
    }, { once: true });

    this.setState({
      activeAudioTrack: wellDone,
    });

    current.load();
    current.play();
    this.audio.current.playbackRate = this.playSpeed;
  }

  gyroTimerStart = () => {
    this.setState({
      activeAudioTrackIndex: 0,
      photoTimerSecs: 6,
      isPhotoTimer: false,
      isFrontFlowButtonDisabled: true,
    });

    this.gyroTimer = setTimeout(this.voiceAfterSuccessGyro, 3000);
  }

  gyroTimerClear = () => {
    clearTimeout(this.gyroTimer);

    this.gyroTimer = null;

    this.setState({
      isFrontFlowButtonDisabled: true,
    });
  }

  photoTimerStart = () => {
    this.photoTimer = setInterval(() => {
      const { photoTimerSecs } = this.state;

      if (photoTimerSecs > 0) {
        // eslint-disable-next-line no-shadow
        this.setState(({ photoTimerSecs }) => ({
          photoTimerSecs: photoTimerSecs - 1,
          isPhotoTimer: true,
        }));
      }

      if (photoTimerSecs === 1) {
        const { current } = this.audio;

        clearInterval(this.photoTimer);

        this.setState({
          isPhotoTimer: false,
          activeAudioTrack: audioPhotoShutter,
        });

        current.load();
        current.play();
        this.audio.current.playbackRate = this.playSpeed;

        this.takePhoto();
      }
    }, 1000);
  }

  // eslint-disable-next-line no-unused-vars
  // componentDidUpdate(previousProps, previousState, snapshot) {
  //   const { info, isGyroTimerAccess } = this.state;
  //   const { current } = this.video;
  //
  //   if (previousState.info !== info) {
  //     if (info) {
  //       // reset gyroTimerStart
  //       if (this.gyroTimer) {
  //         this.gyroTimerClear();
  //       }
  //
  //       // stop current sound
  //       if (!current.paused) {
  //         current.pause();
  //       }
  //     } else if (isGyroTimerAccess && !this.gyroTimer) {
  //       this.gyroTimerStart();
  //     }
  //   }
  // }

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

  voiceStartFrontInstructions = () => {
    const { activeAudioTrackIndex, info } = this.state;
    const { current } = this.audio;

    let track = activeAudioTrackIndex;

    if (track < 3) {
      current.addEventListener('ended', this.voiceStartFrontInstructions, { once: true });
    }

    if (info) {
      current.removeEventListener('ended', this.voiceStartFrontInstructions, { once: true });
      current.pause();
    }

    switch (track) {
      case 0:
        track += 1;

        this.setState({
          activeAudioTrack: audioStepsBackwards,
          activeAudioTrackIndex: track,
        });

        current.load();
        current.play();
            this.audio.current.playbackRate = this.playSpeed;

        break;
      case 1:
        track += 1;

        this.setState({
          activeAudioTrack: audioHighQuality,
          activeAudioTrackIndex: track,
        });

        current.load();
        current.play();
            this.audio.current.playbackRate = this.playSpeed;

        break;
      case 2:
        track += 1;

        this.setState({
          activeAudioTrack: audioFrontInstruction,
          activeAudioTrackIndex: track,
        });

        current.load();
        current.play();
            this.audio.current.playbackRate = this.playSpeed;

        break;

      case 3:
        this.setState({
          activeAudioTrack: audioDontMove,
          activeAudioTrackIndex: 0,
        });

        current.load();
        current.play();
            this.audio.current.playbackRate = this.playSpeed;

        current.addEventListener('ended', this.photoTimerStart, { once: true });

        break;
      default:
        alert('Problems with audio');
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
    } finally {
      this.setState({
        isButtonInit: true,
      });
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
      isButtonInit: false,
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

  handleClick = () => {
    this.voiceStartFrontInstructions();

    // this.takePhoto();
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

      window.location.reload();
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
    const { isGyroTimerAccess, isFirstAudio } = this.state;

    this.b = Math.round(_b);
    this.g = Math.round(_g);

    this.rotY += (this.g - this.rotY) / 5;
    this.rotX += (this.b - this.rotX) / 5;

    if (this.b < 75 || this.b > 105) {
      // reset gyroTimerStart
      if (this.gyroTimer) {
        this.gyroTimerClear();
      }

      // stop current sound
      if (!isFirstAudio) {
        this.audio.current.pause();
      }

      this.setState({
        info: true,
        isFrontFlowButtonDisabled: true,
        activeAudioTrackIndex: 0,
        photoTimerSecs: 6,
      });
    } else {
      if (isGyroTimerAccess && !this.gyroTimer) {
        this.gyroTimerStart();
      }

      this.setState({ info: false });
    }
  };

  // normalizeData = (_g, _b) => {
  //   this.b = Math.round(_b);
  //   this.g = Math.round(_g);
  //
  //   this.rotY += (this.g - this.rotY) / 5;
  //   this.rotX += (this.b - this.rotX) / 5;
  //
  //   if (this.b < 75 || this.b > 105) {
  //     this.setState({ info: true });
  //   } else {
  //     this.setState({ info: false });
  //   }
  // };

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
      camerasBack,
      activeCamera,
      gyroscopePosition,
      isButtonInit,
      activeAudioTrack,
      tapScreen,
      isFrontFlowButtonDisabled,
      isPhotoTimer,
      photoTimerSecs,
    } = this.state;

    const { type = 'front', flowMode = 'front-mode' } = this.props;

    return (
      <div
        className={classNames('widget-camera', {
          'widget-camera--front-mode': flowMode === 'front-mode',
        })}
        ref={this.initCamera}
      >
        {flowMode === 'front-mode' && tapScreen ? (
          <div className="widget-camera__tap-screen">
            <img className="widget-camera__tap-screen-icon" src={muteIcon} alt="sound-on" />
            <p className="widget-camera__tap-screen-text">
              Please check the sound on your phone.
              <br />
              To use voice instructions, it
              <b> must be turned on.</b>
            </p>
            <button
              className="widget-camera__button widget-camera__tap-screen-button"
              type="button"
              onClick={this.tapToStart}
            >
              done
            </button>
          </div>
        ) : null }

        {isPhotoTimer ? <div className="widget-camera__photo-timer">{photoTimerSecs}</div> : null}

        <img className="widget-camera__top-icon" src={pose} alt="human" />
        <div className="widget-camera__title">
          {`${type} photo`}
          <audio ref={this.audio} controls preload="auto">
            <source src={activeAudioTrack} type="audio/mp3" />
          </audio>
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

        <div
          className={classNames('widget-camera-controls', {
            'widget-camera-controls--warning': info,
          })}
          onClick={process.env.NODE_ENV !== 'production' ? this.iphoneGyroStart : null}
        >
          {this.before(!processing
                && (
                <button
                  className="widget-camera-take-photo"
                  onClick={this.handleClick}
                  type="button"
                  disabled={info || !isButtonInit || isFrontFlowButtonDisabled}
                >
                  <div className={classNames('widget-camera-take-photo-effect')} />
                </button>
                ))}
        </div>

        <div className={classNames('allow-frame', {
          'allow-frame--warning': info,
        })}
        >
          {/* <button onClick={this.audio1}>1</button> */}
          {/* <button onClick={this.audio2}>2</button> */}
          {/* <button onClick={this.audio3}>3</button> */}
          {/* <button onClick={this.audio4}>4</button> */}
          <div className="allow-frame__warning-content">
            <img className="allow-frame__warning-img" src={warning} alt="warning" />
            <h2 className="allow-frame__warning-txt">
              Hold your phone vertically and line up the green arrows
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
