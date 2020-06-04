import {
  h,
  render,
  Component,
  createRef, Fragment,
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

import audioPlaceYourPhone from './audio/Place_your_phone_on_a_table.mp3';
import audioWellDone from './audio/well_done.mp3';
import audioToClickReady from './audio/to_continue.mp3';
import audioStepsBackwards from './audio/take_3_to_4.mp3';
import audioHighQuality from './audio/remember.mp3';
import audioFrontInstruction from './audio/your_legs.mp3';
import audioDontMove from './audio/please_stay_camera_shutter.mp3';
import audioPhotoShutter from './audio/shutter.mp3';
import audioSideStart from './audio/now_lets_take_side_photo.mp3';
import audioTurnLeft from './audio/turn_your_left_side.mp3';
import audioLegsTogether from './audio/push_your_legs_together.mp3';
import audioSuccessFinish from './audio/now_you_can_take_your_phone.mp3';

class Camera extends Component {
  $audio = createRef();

  constructor(props, context) {
    super(props, context);

    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      camerasArr: [],
      activeCamera: -1,
      gyroscopePosition: 180,
      isButtonInit: false,
      tapScreen: props.flowMode === 'front-mode',
      // tapScreen: true,

      activeAudioTrack: audioPlaceYourPhone,
      activeAudioTrackIndex: 0,

      isGyroTimerAccess: false,
      isButtonDisabled: false,
      photoTimerSecs: 6,
      isPhotoTimer: false,
      isFirstAudio: true,
      isSidePhotoFrontFlow: false,
    };

    this.gyroTimer = null;
    this.photoTimer = null;
    this.playSpeed = 1.5;
    this.rotX = 0;
    this.rotY = 0;

    this.cameraType = props.flowMode === 'front-mode' ? 'user' : 'environment';

    this.VIDEO_CONFIG = {
      audio: false,
      video: {
        facingMode: this.cameraType,
        width: { exact: 1280 },
      },
    };
  }

  tapToStart = () => {
    const { current } = this.$audio;

    current.play();
    this.$audio.current.playbackRate = this.playSpeed;

    current.addEventListener('ended', () => {
      this.setState({ isFirstAudio: false });
    }, { once: true });

    this.setState({
      tapScreen: false,
      isGyroTimerAccess: true,
      isButtonDisabled: true,
    });

    this.gyroTimerStart();
  }

  voiceAfterSuccessGyro = () => {
    const { current } = this.$audio;

    current.addEventListener('ended', () => {
      this.setState({
        activeAudioTrack: audioToClickReady,
        isButtonDisabled: false,
      });

      current.load();
      current.play();
      this.$audio.current.playbackRate = this.playSpeed;
    }, { once: true });

    this.setState({
      activeAudioTrack: audioWellDone,
    });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;
  }

  voiceFinal = (img) => {
    const { current } = this.$audio;
    const { saveSide } = this.props;

    this.setState({
      activeAudioTrack: audioSuccessFinish,
    });

    current.load();
    current.play();

    current.addEventListener('ended', () => {
      saveSide(img);
    }, { once: true });
  }

  gyroTimerStart = () => {
    this.setState({
      activeAudioTrackIndex: 0,
      photoTimerSecs: 6,
      isPhotoTimer: false,
      isButtonDisabled: true,
    });

    this.removeAudioEventListeners();

    this.gyroTimer = setTimeout(this.voiceAfterSuccessGyro, 3000);
  }

  gyroTimerClear = () => {
    clearTimeout(this.gyroTimer);

    this.gyroTimer = null;

    this.setState({
      isButtonDisabled: true,
    });
  }

  photoTimerClear = () => {
    clearTimeout(this.photoTimer);

    this.setState({
      isPhotoTimer: false,
    });

    this.photoTimer = null;
  }

  photoTimerStart = () => {
    this.photoTimer = setInterval(async () => {
      const { current } = this.$audio;
      const { photoTimerSecs } = this.state;

      if (photoTimerSecs > 0) {
        // eslint-disable-next-line no-shadow
        this.setState(({ photoTimerSecs }) => ({
          photoTimerSecs: photoTimerSecs - 1,
          isPhotoTimer: true,
        }));
      }

      if (photoTimerSecs === 5) {
        this.setState({
          activeAudioTrack: audioPhotoShutter,
        });

        current.load();
      }

      if (photoTimerSecs === 1) {
        current.play();

        clearInterval(this.photoTimer);

        this.setState({
          isPhotoTimer: false,
          photoTimerSecs: 6,
          isSidePhotoFrontFlow: true,
        });

        await this.takePhoto();
      }
    }, 1000);
  }

  removeAudioEventListeners = () => {
    const { current } = this.$audio;

    current.removeEventListener('ended', this.voiceInstructions, { once: true });
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
        .catch((err) => console.error(err));
    } else {
      window.ondeviceorientation = this.orientation;
    }
  }

  voiceInstructions = () => {
    const { type } = this.props;
    const { activeAudioTrackIndex, info } = this.state;
    const { current } = this.$audio;
    const frontPhoto = type === 'front';

    let track = activeAudioTrackIndex;

    if (track < 3) {
      current.addEventListener('ended', this.voiceInstructions, { once: true });
    }

    if (info) {
      current.removeEventListener('ended', this.voiceInstructions, { once: true });
      current.pause();
    }

    switch (track) {
      case 0:
        track += 1;

        this.setState({
          activeAudioTrack: frontPhoto ? audioStepsBackwards : audioSideStart,
          activeAudioTrackIndex: track,
        });

        current.load();
        current.play();

        this.$audio.current.playbackRate = this.playSpeed;

        break;
      case 1:
        track += 1;

        this.setState({
          activeAudioTrack: frontPhoto ? audioHighQuality : audioTurnLeft,
          activeAudioTrackIndex: track,
        });

        current.load();

        if (frontPhoto) {
          setTimeout(() => {
            current.play();
          }, 4000);
        } else {
          current.play();
        }

        this.$audio.current.playbackRate = this.playSpeed;

        break;
      case 2:
        track += 1;

        this.setState({
          activeAudioTrack: frontPhoto ? audioFrontInstruction : audioLegsTogether,
          activeAudioTrackIndex: track,
        });

        current.load();
        current.play();
        this.$audio.current.playbackRate = this.playSpeed;

        break;

      case 3:
        this.setState({
          activeAudioTrack: audioDontMove,
          activeAudioTrackIndex: 0,
        });

        current.load();
        current.play();
        this.$audio.current.playbackRate = this.playSpeed;

        current.addEventListener('ended', this.photoTimerStart, { once: true });

        break;
      default:
        alert('Problems with audio. Please try again.');

        window.location.reload();
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
    this.startCamera(this.VIDEO_CONFIG, this.getUserDevices);
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
      const devicesArr = [];
      const { flowMode } = this.props;
      const cameraType = flowMode === 'front-mode' ? 'front' : 'back';

      devices.forEach((e) => {
        if (e.kind === 'videoinput' && e.label.includes(cameraType)) {
          devicesArr.push(e.deviceId);
        }
      });

      // for android (start stream from camera by id)
      if (this.is('Android')) {
        this.androidCameraStart(devicesArr);

        return Promise.resolve();
      }

      // for other (start stream from default camera)
      if (devicesArr.length > 1) {
        this.setState({
          camerasArr: devicesArr,
        });
      }
    })

  additionalCamerasCheck = () => navigator.mediaDevices.enumerateDevices()
    .then(async (devices) => {
      const devicesArr = [];

      devices.forEach((e, i) => {
        if (e.kind === 'videoinput' && e.label.includes('back')) {
          devicesArr.push(e.deviceId);
        }
      });

      return devicesArr;
    })

  androidCameraStart = async (cameras) => {
    this.setState({
      camerasArr: cameras,
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
    const { camerasArr } = this.state;
    const { id } = e.target.dataset;
    const videoConfig = {
      video: {
        deviceId: camerasArr[id],
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

  camerasFilter = async (camerasArr) => {
    const filteredCameras = [];
    let isCameraAllowed = false;

    // check for case if the camera is unavailable
    for (let i = 0; i < camerasArr.length; i++) {
      const videoConfig = {
        video: {
          deviceId: camerasArr[i],
          width: { exact: 1280 },
        },
        audio: false,
      };

      try {
        // eslint-disable-next-line no-await-in-loop
        this.stream = await navigator.mediaDevices.getUserMedia(videoConfig);

        filteredCameras.push(camerasArr[i]);

        isCameraAllowed = true;
      } catch (error) {
        console.error(error);
      }
    }

    if (isCameraAllowed) {
      this.setState({
        camerasArr: filteredCameras,
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
    const { flowMode } = this.props;

    if (flowMode === 'front-mode') {
      setTimeout(() => {
        this.gyroscopePointerPosition(beta);
        this.normalizeDataFrontMode(gamma, beta);
      }, 50);
    } else {
      setTimeout(() => {
        this.gyroscopePointerPosition(beta);
        this.normalizeData(gamma, beta);
      }, 50);
    }
  };

  handleClick = async () => {
    const { flowMode } = this.props;

    if (flowMode === 'front-mode') {
      this.voiceInstructions();

      this.setState({
        isButtonDisabled: true,
      });
    } else {
      await this.takePhoto();
    }
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
    const { type, flowMode } = this.props;

    try {
      const { saveFront, saveSide } = this.props;
      const image = await fixOrientation(blob, await getOrientation(blob));

      // front-mode - dont stop stream after first photo
      if (flowMode === 'front-mode') {
        if (type !== 'front') {
          this.stream.getVideoTracks()[0].stop();

          this.setState({
            isSidePhotoFrontFlow: true,
          });
        }
      } else {
        this.stream.getVideoTracks()[0].stop();
      }

      this.setState({ processing: false });

      if (type === 'front') {
        saveFront(image);
      } else if (flowMode === 'front-mode') {
        this.voiceFinal(image);
      } else {
        saveSide(image);
      }

      if (flowMode === 'front-mode') {
        if (type === 'front') {
          this.startStream();

          setTimeout(this.voiceInstructions, 1000);
        }
      }
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

  normalizeDataFrontMode = (_g, _b) => {
    const {
      isGyroTimerAccess,
      isFirstAudio,
      isSidePhotoFrontFlow,
    } = this.state;

    this.b = Math.round(_b);
    this.g = Math.round(_g);

    this.rotY += (this.g - this.rotY) / 5;
    this.rotX += (this.b - this.rotX) / 5;

    if (this.b < 75 || this.b > 105) {
      // reset gyroTimerStart
      if (this.gyroTimer) {
        this.gyroTimerClear();
      }

      // reset photoTimer
      if (this.photoTimer) {
        this.photoTimerClear();
      }

      // stop current sound
      if (!isFirstAudio && !isSidePhotoFrontFlow) {
        this.$audio.current.pause();
      }

      this.setState({
        info: true,
        isButtonDisabled: true,
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
      camerasArr,
      activeCamera,
      gyroscopePosition,
      isButtonInit,
      activeAudioTrack,
      tapScreen,
      isButtonDisabled,
      isPhotoTimer,
      photoTimerSecs,
      isSidePhotoFrontFlow,
    } = this.state;

    const { type = 'front', flowMode = 'back-mode' } = this.props;

    return (
      <div
        className={classNames('widget-camera', {
          'widget-camera--front-mode': flowMode === 'front-mode',
        })}
        ref={this.initCamera}
      >

        {flowMode === 'front-mode' ? (
          <Fragment>
            <img className="widget-camera__top-icon" src={pose} alt="human" />

            <audio ref={this.$audio} preload="auto">
              <source src={activeAudioTrack} type="audio/mp3" />
            </audio>
          </Fragment>
        ) : null}

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
        {camerasArr.length > 1 ? (
          <ul className="widget-camera__cameras">
            {camerasArr.map((e, i) => (
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
                  disabled={info || !isButtonInit || isButtonDisabled}
                >
                  <div className={classNames('widget-camera-take-photo-effect')} />
                </button>
                ))}
        </div>

        <div className={classNames('allow-frame', {
          'allow-frame--warning': info,
          'allow-frame--hidden': isSidePhotoFrontFlow,
        })}
        >
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
