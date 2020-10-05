import {
  h,
  render,
  Component,
  createRef,
  Fragment,
} from 'preact';
import classNames from 'classnames';
import register from 'preact-custom-element';

import AllowFrame from './components/AllowFrame/AllowFrame';
import AllowFrameTF from './components/AllowFrameTF/AllowFrameTF';
import AccessGuide from './components/AccessGuide/AccessGuide';

import {
  getOrientation,
  fixOrientation,
  isSamsungBrowser,
  imgToBase64,
  getChromeVersion,
} from './helpers/utils';

import './Camera.scss';

import pose from './images/ic_pose.svg';
import muteIcon from './images/ic_sound.svg';

// System
import audioTimer from './audio/timer-new.mp3';
import audioPhotoShutter from './audio/shutter-sound-new.mp3';

// Front and side
import audioStandYourPhone from './audio/1.1.mp3';
import audioSuccessGyro from './audio/1.2.mp3';

// Front
import audioFirstInstructionF from './audio/1.3.mp3';
import audioSecondInstructionF from './audio/1.4.mp3';
import audioThirdInstructionF from './audio/1.5.mp3';
import audioFourthInstructionF from './audio/1.6.mp3';
import audioSuccessPhotoF from './audio/1.7.mp3';

// Side
import audioFirstInstructionS from './audio/2.1.mp3';
import audioSecondInstructionS from './audio/2.2.mp3';
import audioThirdInstructionS from './audio/2.3.mp3';
import audioSuccessPhotoS from './audio/2.4.mp3';

// Hard-validation front and side
import audioStandYourPhoneHVFS from './audio/3.1.mp3';
import audioSuccessGyroHVFS from './audio/3.2.mp3';

// Hard-validation front and side - FRONT
import audioFirstInstructionHVFSF from './audio/3.3.mp3';
import audioSecondInstructionHVFSF from './audio/3.4.mp3';
import audioThirdInstructionHVFSF from './audio/3.5.mp3';
import audioSuccessPhotoHVFSF from './audio/3.6.mp3';

// Hard-validation front and side - SIDE
import audioFirstInstructionHVFSS from './audio/4.1.mp3';
import audioSecondInstructionHVFSS from './audio/4.2.mp3';
import audioThirdInstructionHVFSS from './audio/4.3.mp3';
import audioSuccessPhotoHVFSS from './audio/4.4.mp3';

// Hard-validation front
import audioStandYourPhoneHVF from './audio/5.1.mp3';
import audioSuccessGyroHVF from './audio/5.2.mp3';
import audioFirstInstructionHVF from './audio/5.3.mp3';
import audioSecondInstructionHVF from './audio/5.4.mp3';
import audioThirdInstructionHVF from './audio/5.5.mp3';
import audioFourthInstructionHVF from './audio/5.6.mp3';
import audioSuccessPhotoHVF from './audio/5.7.mp3';

// Hard-validation front and side
import audioStandYourPhoneHVS from './audio/6.1.mp3';
import audioSuccessGyroHVS from './audio/6.2.mp3';
import audioFirstInstructionHVS from './audio/6.3.mp3';
import audioSecondInstructionHVS from './audio/6.4.mp3';
import audioThirdInstructionHVS from './audio/6.5.mp3';
import audioFourthInstructionHVS from './audio/6.6.mp3';
import audioSuccessPhotoHVS from './audio/6.7.mp3';

const AUIDO_CASES = {
  standPhone: [
    audioStandYourPhone,
    audioStandYourPhoneHVFS,
    audioStandYourPhoneHVF,
    audioStandYourPhoneHVS,
  ],
  successGyro: [
    audioSuccessGyro,
    audioSuccessGyroHVFS,
    audioSuccessGyroHVF,
    audioSuccessGyroHVS,
  ],
  firstInstruction: [
    audioFirstInstructionF,
    audioFirstInstructionS,
    audioFirstInstructionHVFSF,
    audioFirstInstructionHVFSS,
    audioFirstInstructionHVF,
    audioFirstInstructionHVS,
  ],
  secondInstruction: [
    audioSecondInstructionF,
    audioSecondInstructionS,
    audioSecondInstructionHVFSF,
    audioSecondInstructionHVFSS,
    audioSecondInstructionHVF,
    audioSecondInstructionHVS,
  ],
  thirdInstruction: [
    audioThirdInstructionF,
    audioThirdInstructionS,
    audioThirdInstructionHVFSF,
    audioThirdInstructionHVFSS,
    audioThirdInstructionHVF,
    audioThirdInstructionHVS,
  ],
  fourthInstruction: [
    audioFourthInstructionF,
    null,
    null,
    null,
    audioFourthInstructionHVF,
    audioFourthInstructionHVS,
  ],
  finallySuccess: [
    audioSuccessPhotoS,
    audioSuccessPhotoHVFSS,
    audioSuccessPhotoHVF,
    audioSuccessPhotoHVS,
  ],
};

function savePhoto(image, degree) {
  window.dispatchEvent(
    new CustomEvent(
      'savePhoto',
      { detail: { image, degree: degree ? Math.round(degree * 180 / 360) : degree } },
    )
  );
}

class Camera extends Component {
  $audio = createRef();

  constructor(props, context) {
    super(props, context);

    this.state = {
      imgURI: null,
      processing: false,
      info: false,
      isCameraAccess: true,
      camerasArr: [],
      activeCamera: -1,
      gyroscopePosition: 180,
      isButtonInit: false,
      tapScreen: props.isTableFlow,
      // tapScreen: true,

      activeAudioTrack: audioStandYourPhone,
      activeAudioTrackIndex: 0,

      isGyroTimerAccess: false,
      photoTimerSecs: 4,
      isPhotoTimer: false,
      isFirstAudio: true,
      isLastPhoto: false,
    };

    this.gyroTimer = null;
    this.photoTimer = null;
    this.playSpeed = 1;
    this.rotX = 0;
    this.rotY = 0;

    // in dev mode comment 3 lines below
    if (props.hardValidation) {
      this.hardValidationFS = props.hardValidation.front && props.hardValidation.side;
      this.hardValidationF = props.hardValidation.front && !props.hardValidation.side;
      this.hardValidationS = !props.hardValidation.front && props.hardValidation.side;
      this.isHardValidation = this.hardValidationFS || this.hardValidationF || this.hardValidationS;
    }

    this.cameraType = props.type === 'front' ? 'user' : 'environment';

    this.VIDEO_CONFIG = {
      audio: false,
      video: {
        facingMode: this.cameraType,
        width: { exact: 1280 },
      },
    };
  }

  componentDidMount() {
    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    }, this.startStream);

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.orientation);
          } else {
            this.isGyroActiveIphone();
          }
        })
        .catch((err) => console.error(err));
    } else {
      this.isGyroActive();
    }

    // is phone locked detect
    let hidden;
    let visibilityChange;

    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    this.handleVisibilityChange = async () => {
      if (document[hidden]) {
        await window.location.reload();
      }
    };

    document.addEventListener(visibilityChange, this.handleVisibilityChange);
  }

  componentWillUnmount() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  isGyroActive = () => {
    window.addEventListener('deviceorientation', (event) => {
      if (event.beta === null || event.gamma === null) {
        const { isTableFlow } = this.props;

        if (isTableFlow) {
          this.gyroDisabledMsg();
        }
      } else {
        window.ondeviceorientation = this.orientation;
      }
    }, { once: true });
  }

  isGyroActiveIphone = () => {
    const { isTableFlow } = this.props;

    if (isTableFlow) {
      this.gyroDisabledMsg();
    }
  }

  gyroDisabledMsg = () => {
    alert('Oops!.. To continue use AI assistant you need to turn on GYROSCOPE!\nTo use HANDS-FREE mode please turn on GYROSCOPE in your mobile setting and restart browser.\nWithout GYROSCOPE, you can use just WITH A FRIEND Mode.');
  }

  // tap at the bottom of the screen to allow gyroscope for iphone in dev mode
  iphoneGyroStart = () => {
    // window.addEventListener('deviceorientation', this.getDeviceCoordinates, { once: true });

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this.orientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', this.orientation);
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

      this.setState({ isCameraAccess: false });
      document.querySelector('.widget-camera').classList.add('widget-camera--z-i-20');

      if (this.$audio) {
        this.$audio.current.pause();
      }
    } finally {
      this.setState({
        isButtonInit: true,
      });
    }
  }

  getUserDevices = () => navigator.mediaDevices.enumerateDevices()
    .then(async (devices) => {
      const devicesArr = [];
      const { type } = this.props;
      const cameraType = type === 'front' ? 'front' : 'back';

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
    const { isTableFlow } = this.props;

    if (isTableFlow) {
      setTimeout(() => {
        this.gyroscopePointerPosition(beta);
        this.normalizeDataTableFlow(gamma, beta);
      }, 50);
    } else {
      setTimeout(() => {
        this.gyroscopePointerPosition(beta);
        this.normalizeData(gamma, beta);
      }, 50);
    }
  };

  takePhoto = async () => {
    const { isTableFlow } = this.props;
    const callback = isTableFlow ? this.setPhotoTableFlow : this.setPhoto;

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

      // window.addEventListener('deviceorientation', this.getDeviceCoordinates, { once: true });

      this.setState({ processing: true }, () => canvas.toBlob(callback));
    } catch (exception) {
      console.error(`Error: ${exception}`);

      alert(`Error taking photo: ${exception}`);

      window.location.reload();
    }
  };

  setPhoto = async (blob) => {
    const {
      type,
    } = this.props;

    try {
      let image;

      // for chrome >= 81 we dont need to use fixOrientation
      if (this.is('Android') && getChromeVersion() >= 81) {
        image = await imgToBase64(blob);
      } else {
        image = await fixOrientation(blob, await getOrientation(blob));
      }

      this.stream.getVideoTracks()[0].stop();
      this.setState({ processing: false });

      savePhoto(image, this.state.gyroscopePosition);

    } catch (exception) {
      console.error(`Error: ${exception}`);

      alert(`Error setting photo: ${exception}`);

      window.location.reload();
    }
  }

  // table flow
  setPhotoTableFlow = async (blob) => {
    const { type } = this.props;

    try {
      let image;

      // for chrome >= 81 we dont need to use fixOrientation
      if (this.is('Android') && getChromeVersion() >= 81) {
        image = await imgToBase64(blob);
      } else {
        image = await fixOrientation(blob, await getOrientation(blob));
      }

      this.setState({ processing: false });

      this.video.play();

      if (type === 'front') {
        this.setFrontPhotoTableFlow(image);
      } else {
        this.setState({
          isLastPhoto: true,
        });

        this.playFinalSuccessPhotoAudio(image);
      }
    } catch (exception) {
      console.error(`Error: ${exception}`);

      alert('Problems with setting photo. Please try again.');
    }
  }

  // table flow
  setFrontPhotoTableFlow = async (img) => {
    const { hardValidation } = this.props;

    if (hardValidation.front && !hardValidation.side) {
      this.setState({
        isLastPhoto: true,
      });

      this.playFinalSuccessPhotoAudio(img);
    } else {
      const { current } = this.$audio;

      savePhoto(img);

      this.setState({
        activeAudioTrack: this.specifySuccessPhotoAudio(),
      });

      current.load();
      current.play();

      current.addEventListener('ended', this.playAudioInstructions, { once: true });
    }
  }

  // table flow
  specifySuccessPhotoAudio = () => {
    let track = audioSuccessPhotoF;

    if (this.hardValidationFS) {
      track = audioSuccessPhotoHVFSF;
    }

    return track;
  }

  retryPhoto = () => {
    const { imgURI } = this.state;

    if (imgURI) {
      this.setState({ imgURI: null, processing: false }, this.startStream);
    }
  }

  before(component) {
    /* const { imgURI, processing } = this.state;
    const { isTableFlow } = this.props;

    if ((imgURI || processing) && !isTableFlow) {
      return;
    } */

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
    const { isTableFlow } = this.props;

    if (!processing || isTableFlow) {
      return;
    }

    return component;
  };

  normalizeDataTableFlow = (_g, _b) => {
    const {
      isGyroTimerAccess,
      isFirstAudio,
      isLastPhoto,
    } = this.state;

    this.b = Math.round(_b);
    this.g = Math.round(_g);

    this.rotY += (this.g - this.rotY) / 5;
    this.rotX += (this.b - this.rotX) / 5;

    if (this.b < 85 || this.b > 100) {
      // reset startGyroTimer
      if (this.gyroTimer) {
        this.clearGyroTimer();
      }

      // reset photoTimer
      if (this.photoTimer) {
        this.clearPhotoTimer();
      }

      // stop current sound
      if (!isFirstAudio && !isLastPhoto) {
        this.$audio.current.pause();
      }

      this.video.play();

      this.setState({
        info: true,
        activeAudioTrackIndex: 0,
        photoTimerSecs: 4,
      });
    } else {
      if (isGyroTimerAccess && !this.gyroTimer) {
        this.startGyroTimer();
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

  // table flow
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

  // table flow
  specifyAudioTrack = (tracks) => {
    /* eslint-disable prefer-destructuring */
    let track = tracks[0];

    if (this.hardValidationFS) {
      track = tracks[1];
    } else if (this.hardValidationF) {
      track = tracks[2];
    } else if (this.hardValidationS) {
      track = tracks[3];
    }

    return track;
    /* eslint-enable prefer-destructuring */
  }

  // table flow
  specifyAudioTrackFS = (tracks) => {
    /* eslint-disable prefer-destructuring */
    const { type } = this.props;
    const isFrontPhoto = type === 'front';

    let track = isFrontPhoto ? tracks[0] : tracks[1];

    if (this.hardValidationFS) {
      track = isFrontPhoto ? tracks[2] : tracks[3];
    } else if (this.hardValidationF) {
      track = tracks[4];
    } else if (this.hardValidationS) {
      track = tracks[5];
    }

    return track;
    /* eslint-enable prefer-destructuring */
  }

  // table flow
  playFirstAudio = () => {
    const { current } = this.$audio;
    const { onClickDone } = this.props;

    if (onClickDone) onClickDone();

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.standPhone),
    });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;

    current.addEventListener('ended', () => {
      // next method is this.startGyroTimer
      this.setState({
        isFirstAudio: false,
        isGyroTimerAccess: true,
      });
    }, { once: true });

    this.setState({
      tapScreen: false,
    });
  }

  // table flow
  startGyroTimer = () => {
    this.setState({
      activeAudioTrackIndex: 0,
      photoTimerSecs: 4,
      isPhotoTimer: false,
    });

    this.removeAudioEventListeners();

    this.gyroTimer = setTimeout(this.playSuccessGyroAudio, 2000);
  }

  // table flow
  clearGyroTimer = () => {
    clearTimeout(this.gyroTimer);

    this.gyroTimer = null;
  }

  // table flow
  playSuccessGyroAudio = () => {
    const { current } = this.$audio;

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.successGyro),
    });

    current.addEventListener('ended', this.playAudioInstructions, { once: true });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;
  }

  // table flow
  countFrontAudioInstructions = () => {
    const { type } = this.props;
    const { activeAudioTrackIndex } = this.state;

    return !(type === 'front' && activeAudioTrackIndex >= 3 && !this.isHardValidation);
  }

  // table flow
  countSideAudioInstructions = () => {
    const { type } = this.props;
    const { activeAudioTrackIndex } = this.state;

    return !(type === 'side' && activeAudioTrackIndex >= 2 && !this.isHardValidation);
  }

  // table flow
  countFrontAudioInstructionsHV = () => {
    const { activeAudioTrackIndex } = this.state;

    return !(this.hardValidationF && activeAudioTrackIndex >= 3);
  }

  // table flow
  countSideAudioInstructionsHV = () => {
    const { activeAudioTrackIndex } = this.state;

    return !(this.hardValidationS && activeAudioTrackIndex >= 3);
  }

  // table flow
  countFrontAudioInstructionsHVF = () => {
    const { type } = this.props;
    const { activeAudioTrackIndex } = this.state;

    return !(type === 'front' && this.hardValidationFS && activeAudioTrackIndex >= 2);
  }

  // table flow
  countFrontAudioInstructionsHVS = () => {
    const { type } = this.props;
    const { activeAudioTrackIndex } = this.state;

    return !(type === 'side' && this.hardValidationFS && activeAudioTrackIndex >= 2);
  }

  // table flow
  countAudioInstructions = () => {
    if (!this.countFrontAudioInstructions()) {
      return false;
    }

    if (!this.countSideAudioInstructions()) {
      return false;
    }

    if (!this.countFrontAudioInstructionsHV()) {
      return false;
    }

    if (!this.countSideAudioInstructionsHV()) {
      return false;
    }

    if (!this.countFrontAudioInstructionsHVF()) {
      return false;
    }

    return this.countFrontAudioInstructionsHVS();
  }

  // table flow
  playAudioInstructions = () => {
    const { activeAudioTrackIndex } = this.state;
    const { type } = this.props;
    const { current } = this.$audio;
    let trackIndex = activeAudioTrackIndex;

    if (this.countAudioInstructions()) {
      current.addEventListener('ended', this.playAudioInstructions, { once: true });
    } else {
      current.addEventListener('ended', this.startPhotoTimer, { once: true });
    }

    this.setState({
      activeAudioTrack: this.specifyAudioInstruction(trackIndex),
      activeAudioTrackIndex: trackIndex += 1,
    });

    current.load();

    if ((type === 'front' && activeAudioTrackIndex === 1)
    || (this.hardValidationS && activeAudioTrackIndex === 1)) {
      // setTimeout is for user to have some time to move away
      setTimeout(() => {
        current.play();
      }, 3000);
    } else {
      current.play();
    }

    this.$audio.current.playbackRate = this.playSpeed;
  }

  // table flow
  specifyAudioInstruction = (index) => {
    let track;

    switch (index) {
      case 0:
        track = this.specifyAudioTrackFS(AUIDO_CASES.firstInstruction);

        break;
      case 1:
        track = this.specifyAudioTrackFS(AUIDO_CASES.secondInstruction);

        break;
      case 2:
        track = this.specifyAudioTrackFS(AUIDO_CASES.thirdInstruction);

        break;
      case 3:
        track = this.specifyAudioTrackFS(AUIDO_CASES.fourthInstruction);

        break;
      default:
        alert('Problems with audio. Please try again.');

        window.location.reload();
    }

    return track;
  }

  // table flow
  startPhotoTimer = () => {
    const { current } = this.$audio;

    this.setState({
      activeAudioTrackIndex: 0,
      activeAudioTrack: audioTimer,
    });

    current.addEventListener('canplay', this.showPhotoTimer, { once: true });

    current.load();

    if (this.is('Android')) {
      setTimeout(() => {
        current.play();
      }, 1000);
    } else {
      current.play();
    }
  }

  // table flow
  showPhotoTimer = () => {
    const { current } = this.$audio;

    this.photoTimer = setInterval(async () => {
      const { photoTimerSecs } = this.state;

      if (photoTimerSecs > 0) {
        // eslint-disable-next-line no-shadow
        this.setState(({ photoTimerSecs }) => ({
          photoTimerSecs: photoTimerSecs - 1,
          isPhotoTimer: true,
        }));
      }

      if (photoTimerSecs === 1) {
        clearInterval(this.photoTimer);

        this.setState({
          isPhotoTimer: false,
          photoTimerSecs: 4,
          activeAudioTrack: audioPhotoShutter,
        });

        this.video && this.video.pause();

        current.load();
        current.play();

        current.addEventListener('ended', this.takePhoto, { once: true });
      }
    }, 5000);
  }

  // table flow
  clearPhotoTimer = () => {
    clearTimeout(this.photoTimer);

    this.setState({
      isPhotoTimer: false,
    });

    this.photoTimer = null;
  }

  // table flow
  playFinalSuccessPhotoAudio = (img) => {
    const { current } = this.$audio;
    const {
      type,
    } = this.props;

    if (type === 'front') {
      savePhoto(img);
    } else {
      savePhoto(img);
    }

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.finallySuccess),
    });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;
  }

  // table flow
  removeAudioEventListeners = () => {
    const { current } = this.$audio;

    current.removeEventListener('ended', this.playAudioInstructions, { once: true });
    current.removeEventListener('ended', this.startPhotoTimer, { once: true });
    current.removeEventListener('ended', this.takePhoto, { once: true });
    current.removeEventListener('canplay', this.showPhotoTimer, { once: true });
  }

  /* getDeviceCoordinates = (e) => {
    const { setDeviceCoordinates } = this.props;
    const { beta, gamma, alpha } = e;

    const coordinates = {
      ...(beta && { betaX: beta }),
      ...(gamma && { gammaY: gamma }),
      ...(alpha && { alphaZ: alpha }),
    };

    setDeviceCoordinates(coordinates);
  } */

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
      isPhotoTimer,
      photoTimerSecs,
      isLastPhoto,
      isCameraAccess,
    } = this.state;

    const { type = 'front', isTableFlow = false } = this.props;

    return (
      <div
        className={classNames('widget-camera', {
          'widget-camera--table-flow': isTableFlow,
        })}
      >

        {!isCameraAccess ? (
          <AccessGuide
            isAndroid={this.is('Android')}
          />
        ) : null}

        {isTableFlow ? (
          <Fragment>
            <img className="widget-camera__top-icon" src={pose} alt="human" />

            <audio ref={this.$audio} preload="auto">
              <source src={activeAudioTrack} type="audio/mp3" />
            </audio>
          </Fragment>
        ) : null}

        {isTableFlow && tapScreen ? (
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
              onClick={this.playFirstAudio}
            >
              done
            </button>
          </div>
        ) : null}

        {isTableFlow && isPhotoTimer ? <div className="widget-camera__photo-timer">{photoTimerSecs}</div> : null}

        <div className="widget-camera__title">
          {`${type} photo`}
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

        {isTableFlow ? (
          <AllowFrameTF
            gyroscopePosition={gyroscopePosition}
            isLastPhoto={isLastPhoto}
            info={info}
          />
        ) : (
          <Fragment>
            <div
              className={classNames('widget-camera-controls', {
                'widget-camera-controls--warning': info,
              })}
              onClick={this.iphoneGyroStart}
            >
              {this.before(!processing
                  && (
                  <button
                    className="widget-camera-take-photo"
                    onClick={this.takePhoto}
                    type="button"
                    disabled={!isButtonInit}
                  >
                    <div className={classNames('widget-camera-take-photo-effect')} />
                  </button>
                  ))}
            </div>

            <AllowFrame
              gyroscopePosition={gyroscopePosition}
              isLastPhoto={isLastPhoto}
              info={info}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

register(Camera, 'app-react-camera', [
  'type',
  'isTableFlow',
  'hardValidation',
]);
/* process.env.NODE_ENV === 'production' || render(<Camera />, document.body);
 */
export default Camera;
