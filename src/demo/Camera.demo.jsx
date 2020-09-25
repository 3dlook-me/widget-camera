import { h, Component, render } from "preact";
import Camera from "../Camera.jsx";

export default class App extends Component {
  state = {
    cameraOn: false,
    type: null,
    hardValidation: { front: null, side: null }
  };

  saveFrontFile = (file) => {
    console.log("saveFrontFile", file);
    this.setState({ type: null });
  };

  saveSideFile = (file) => {
    console.log("saveSideFile", file);
    this.setState({ type: null });
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
    const { type, hardValidation } = this.state;

    return (
      <div>
        <h1>Camera</h1>
        <button type="button" onClick={this.toggleCamera("front")}>
          Take front foto
        </button>
        <button type="button" onClick={this.toggleCamera("side")}>
          Take side foto
        </button>
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