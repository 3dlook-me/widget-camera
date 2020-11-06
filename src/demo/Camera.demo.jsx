import { h, Component, render } from "preact";
import Camera from "../Camera.jsx";

export default class App extends Component {
  state = {
    cameraOn: false,
    type: null,
    hardValidation: { front: null, side: null },
    frontImage: null,
    sideImage: null,
  };

  saveFrontFile = (file) => {
    console.log("saveFrontFile", file);
    this.setState({
      type: null,
      frontImage: file,
    });
  };

  saveSideFile = (file) => {
    console.log("saveSideFile", file);
    this.setState({
      type: null,
      sideImage: file,
    });
  };

  disableTableFlow = () => {
    console.log("disableTableFlow");
  };

  turnOffCamera = () => {
    console.log("turnOffCamera");
  };

  setDeviceCoordinates = (coords) => {
    console.log("setDeviceCoordinates", coords);
  };

  toggleCamera = (type) => () => {
    this.setState({ type });
  };

  render() {
    const {
      type,
      hardValidation,
      frontImage,
      sideImage,
    } = this.state;

    return (
      <div>
        <h1>Camera</h1>
        <button type="button" onClick={this.toggleCamera("front")}>
          Take front foto
        </button>
        <button type="button" onClick={this.toggleCamera("side")}>
          Take side foto
        </button>
        <div>
          <p>Front image:</p>
          {(frontImage) ? (
            <img src={frontImage} alt="Front photo"/>
          ) : (
            <p>None</p>
          )}
          <p>Side image:</p>
          {(sideImage) ? (
            <img src={sideImage} alt="Side photo"/>
          ) : (
            <p>None</p>
          )}
        </div>
        {type && (
          <Camera
            type={type}
            saveFront={this.saveFrontFile}
            saveSide={this.saveSideFile}
            isTableFlow={false}
            hardValidation={hardValidation}
            disableTableFlow={this.disableTableFlow}
            turnOffCamera={this.turnOffCamera}
            setDeviceCoordinates={this.setDeviceCoordinates}
          />
        )}
      </div>
    );
  }
}

render(<App />, document.body);