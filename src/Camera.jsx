import {
  h,
  render,
  Component,
  createRef,
  Fragment,
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

// System
import audioTimer from './audio/timer.mp3';
import audioPhotoShutter from './audio/shutter.mp3';

// Front and side
import audioStandYourPhone from './audio/Table Flow Script 1 1.1.mp3';
import audioSuccessGyro from './audio/Table Flow Script 1 1.2.mp3';
import audioToClickReadyBtn from './audio/Table Flow Script 1 1.3.mp3';

// Front
import audioFirstInstructionF from './audio/Table Flow Script 1 1.4.mp3';
import audioSecondInstructionF from './audio/Table Flow Script 1 1.5.mp3';
import audioThirdInstructionF from './audio/Table Flow Script 1 1.6.mp3';
import audioFourthInstructionF from './audio/Table Flow Script 1 1.7.mp3';
import audioSuccessPhotoF from './audio/Table Flow Script 1 1.8.mp3';

// Side
import audioFirstInstructionS from './audio/Table Flow Script 1 2.1.mp3';
import audioSecondInstructionS from './audio/Table Flow Script 1 2.2.mp3';
import audioThirdInstructionS from './audio/Table Flow Script 1 2.3.mp3';
import audioFourthInstructionS from './audio/Table Flow Script 1 2.4.mp3';
import audioSuccessPhotoS from './audio/Table Flow Script 1 2.5.mp3';

// Hard-validation front and side
import audioStandYourPhoneHVFS from './audio/Table Flow Script 1 3.1.mp3';
import audioSuccessGyroHVFS from './audio/Table Flow Script 1 3.2.mp3';
import audioToClickReadyBtnHVFS from './audio/Table Flow Script 1 3.3.mp3';

// Hard-validation front and side - FRONT
import audioFirstInstructionHVFSF from './audio/Table Flow Script 1 3.4.mp3';
import audioSecondInstructionHVFSF from './audio/Table Flow Script 1 3.5.mp3';
import audioThirdInstructionHVFSF from './audio/Table Flow Script 1 3.6.mp3';
import audioFourthInstructionHVFSF from './audio/Table Flow Script 1 3.7.mp3';
import audioSuccessPhotoHVFSF from './audio/Table Flow Script 1 3.8.mp3';

// Hard-validation front and side - SIDE
import audioFirstInstructionHVFSS from './audio/Table Flow Script 1 4.1.mp3';
import audioSecondInstructionHVFSS from './audio/Table Flow Script 1 4.2.mp3';
import audioThirdInstructionHVFSS from './audio/Table Flow Script 1 4.3.mp3';
import audioFourthInstructionHVFSS from './audio/Table Flow Script 1 4.4.mp3';
import audioSuccessPhotoHVFSS from './audio/Table Flow Script 1 4.5.mp3';

// Hard-validation front
import audioStandYourPhoneHVF from './audio/Table Flow Script 1 5.1.mp3';
import audioSuccessGyroHVF from './audio/Table Flow Script 1 5.2.mp3';
import audioToClickReadyBtnHVF from './audio/Table Flow Script 1 5.3.mp3';
import audioFirstInstructionHVF from './audio/Table Flow Script 1 5.4.mp3';
import audioSecondInstructionHVF from './audio/Table Flow Script 1 5.5.mp3';
import audioThirdInstructionHVF from './audio/Table Flow Script 1 5.6.mp3';
import audioFourthInstructionHVF from './audio/Table Flow Script 1 5.7.mp3';
import audioSuccessPhotoHVF from './audio/Table Flow Script 1 5.8.mp3';

// Hard-validation front and side
import audioStandYourPhoneHVS from './audio/Table Flow Script 1 6.1.mp3';
import audioSuccessGyroHVS from './audio/Table Flow Script 1 6.2.mp3';
import audioToClickReadyBtnHVS from './audio/Table Flow Script 1 6.3.mp3';
import audioFirstInstructionHVS from './audio/Table Flow Script 1 6.4.mp3';
import audioSecondInstructionHVS from './audio/Table Flow Script 1 6.5.mp3';
import audioThirdInstructionHVS from './audio/Table Flow Script 1 6.6.mp3';
import audioFourthInstructionHVS from './audio/Table Flow Script 1 6.7.mp3';
import audioFifthInstructionHVS from './audio/Table Flow Script 1 6.8.mp3';
import audioSixthInstructionHVS from './audio/Table Flow Script 1 6.9.mp3';
import audioSuccessPhotoHVS from './audio/Table Flow Script 1 6.10.mp3';

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
  toClickReady: [
    audioToClickReadyBtn,
    audioToClickReadyBtnHVFS,
    audioToClickReadyBtnHVF,
    audioToClickReadyBtnHVS,
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
    audioFourthInstructionS,
    audioFourthInstructionHVFSF,
    audioFourthInstructionHVFSS,
    audioFourthInstructionHVF,
    audioFourthInstructionHVS,
  ],
  finallSuccess: [
    audioSuccessPhotoS,
    audioSuccessPhotoHVFSS,
    audioSuccessPhotoHVF,
    audioSuccessPhotoHVS,
  ],
};

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
      tapScreen: props.isTableFlow,
      // tapScreen: true,

      activeAudioTrack: audioStandYourPhone,
      activeAudioTrackIndex: 0,

      isGyroTimerAccess: false,
      isButtonDisabled: false,
      photoTimerSecs: 6,
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
    this.hardValidationFS = props.hardValidation.front && props.hardValidation.side;
    this.hardValidationF = props.hardValidation.front && !props.hardValidation.side;
    this.hardValidationS = !props.hardValidation.front && props.hardValidation.side;

    this.cameraType = props.isTableFlow ? 'user' : 'environment';

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
            window.ondeviceorientation = this.orientation;
          } else {
            this.isGyroActiveIphone();
          }
        })
        .catch((err) => console.error(err));
    } else {
      this.isGyroActive();
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
    const { disableTableFlow } = this.props;

    disableTableFlow();

    alert('Oops!.. To continue use AI assistant you need to turn on GYROSCOPE!\nTo use AI ASSISTANT mode please turn on GYROSCOPE in your mobile setting and restart browser.\nWithout GYROSCOPE, you can use just WITH A FRIEND Mode.');

    window.location.href = '#/camera-mode-selection';
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
      const { isTableFlow } = this.props;
      const cameraType = isTableFlow ? 'front' : 'back';

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

  handleClick = async () => {
    const { isTableFlow } = this.props;

    if (isTableFlow) {
      this.playAudioInstructions();

      this.setState({
        isButtonDisabled: true,
      });
    } else {
      await this.takePhoto();
    }
  }

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
      this.setState({ processing: true }, () => canvas.toBlob(callback));
    } catch (exception) {
      alert(`Error: ${exception}`);

      window.location.reload();
    }
  };

  setPhoto = async (blob) => {
    const {
      saveFront,
      saveSide,
      type,
    } = this.props;

    try {
      const image = await fixOrientation(blob, await getOrientation(blob));
      this.stream.getVideoTracks()[0].stop();
      this.setState({ processing: false });

      if (type === 'front') {
        saveFront(image);
      } else {
        saveSide(image);
      }
    } catch (exception) {
      alert(`Error: ${exception}`);
    }
  }

  // table flow
  setPhotoTableFlow = async (blob) => {
    const { type } = this.props;

    try {
      const image = await fixOrientation(blob, await getOrientation(blob));

      this.setState({ processing: false });

      if (type === 'front') {
        this.setFrontPhotoTableFlow(image);
      } else {
        this.stream.getVideoTracks()[0].stop();

        this.setState({
          isLastPhoto: true,
        });

        this.playFinalSuccessPhotoAudio(image);
      }
    } catch (exception) {
      alert(`Error: ${exception}`);
    }
  }

  // table flow
  setFrontPhotoTableFlow = async (img) => {
    const { hardValidation, saveFront } = this.props;

    if (hardValidation.front && !hardValidation.side) {
      this.stream.getVideoTracks()[0].stop();

      this.setState({
        isLastPhoto: true,
      });

      this.playFinalSuccessPhotoAudio(img);
    } else {
      const { current } = this.$audio;

      saveFront(img);

      this.setState({
        activeAudioTrack: this.specifySuccessPhotoAudio(),
      });

      current.load();
      current.play();

      current.addEventListener('ended', this.playAudioInstructions, { once: true });

      this.startStream();
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

      this.setState({
        info: true,
        isButtonDisabled: true,
        activeAudioTrackIndex: 0,
        photoTimerSecs: 6,
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
      isButtonDisabled: true,
    });
  }

  // table flow
  startGyroTimer = () => {
    this.setState({
      activeAudioTrackIndex: 0,
      photoTimerSecs: 6,
      isPhotoTimer: false,
      isButtonDisabled: true,
    });

    this.removeAudioEventListeners();

    this.gyroTimer = setTimeout(this.playSuccessGyroAudio, 3000);
  }

  // table flow
  clearGyroTimer = () => {
    clearTimeout(this.gyroTimer);

    this.gyroTimer = null;

    this.setState({
      isButtonDisabled: true,
    });
  }

  // table flow
  playSuccessGyroAudio = () => {
    const { current } = this.$audio;

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.successGyro),
    });

    current.addEventListener('ended', this.playToClickReadyBtnAudio, { once: true });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;
  }

  // table flow
  playToClickReadyBtnAudio = () => {
    const { current } = this.$audio;

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.toClickReady),
      isButtonDisabled: false,
    });

    // next method if user taps ready is this.handleClick -> this.playAudioInstructions
    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;
  }

  // table flow
  playAudioInstructions = () => {
    const { activeAudioTrackIndex } = this.state;
    const { type } = this.props;
    const { current } = this.$audio;
    let trackIndex = activeAudioTrackIndex;

    if ((activeAudioTrackIndex < 5 && this.hardValidationS)
        || (activeAudioTrackIndex < 3 && !this.hardValidationS)) {
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
      case 4:
        // only for side hard validation
        track = audioFifthInstructionHVS;

        break;
      case 5:
        // only for side hard validation
        track = audioSixthInstructionHVS;

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
          photoTimerSecs: 6,
          activeAudioTrack: audioPhotoShutter,
        });

        current.load();
        current.play();

        current.addEventListener('ended', this.takePhoto, { once: true });
      }
    }, 1000);
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
      saveSide,
      saveFront,
      type,
      turnOffCamera,
    } = this.props;

    if (type === 'front') {
      saveFront(img);
    } else {
      saveSide(img);
    }

    this.setState({
      activeAudioTrack: this.specifyAudioTrack(AUIDO_CASES.finallSuccess),
    });

    current.load();
    current.play();
    this.$audio.current.playbackRate = this.playSpeed;

    current.addEventListener('ended', () => {
      turnOffCamera();
    }, { once: true });
  }

  // table flow
  removeAudioEventListeners = () => {
    const { current } = this.$audio;

    current.removeEventListener('ended', this.playToClickReadyBtnAudio, { once: true });
    current.removeEventListener('ended', this.playAudioInstructions, { once: true });
    current.removeEventListener('ended', this.startPhotoTimer, { once: true });
    current.removeEventListener('ended', this.takePhoto, { once: true });
    current.removeEventListener('canplay', this.showPhotoTimer, { once: true });
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
      isLastPhoto,
    } = this.state;

    const { type = 'front', isTableFlow = true } = this.props;

    return (
      <div
        className={classNames('widget-camera', {
          'widget-camera--front-mode': isTableFlow,
        })}
        ref={this.initCamera}
      >

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
          'allow-frame--hidden': isLastPhoto,
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

process.env.NODE_ENV !== 'production' || render(<Camera />, document.body);

export default Camera;
