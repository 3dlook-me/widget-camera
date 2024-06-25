import { h, Component, render } from "preact";
import Camera from "../Camera.jsx";

class App extends Component {
    state = {
        cameraOn: false,
        type: null,
        hardValidation: { front: null, side: null },
        isTableFlow: false,
        frontImage: null,
        sideImage: null,
    };


    resetState() {
        this.setState({
            cameraOn: false,
            type: null,
            hardValidation: { front: null, side: null },
            isTableFlow: false,
            frontImage: null,
            sideImage: null,
        });
    }


    componentWillMount() {
        window.addEventListener('message', (event) => {
            if (!event.data.hello) {
                console.log(event.data);
                const { type, isTableFlow, hardValidation } = event.data;
                if (type && (type === 'front') || (type === 'side')) {

                    this.resetState();
                    this.setState({
                        type,
                        isTableFlow,
                        hardValidation: hardValidation ? hardValidation : { front: null, side: null },
                    });

                    console.log(event.data);
                }
            }
        }, false);
    }


    sendMessage(type) {
        const {
            frontImage,
            sideImage,
        } = this.state;

        //window.postMessage(JSON.stringify({ eventType: `save ${type} file`, front: frontImage, side: sideImage }));
        window.ReactNativeWebView.postMessage(JSON.stringify({ eventType: `save ${type} file`, front: frontImage, side: sideImage }));
    }


    saveFrontFile = (file) => {
        const {
            hardValidation,
            isTableFlow,
        } = this.state;

        console.log("saveFrontFile", file);
        this.setState({
            type: null,
            frontImage: file,
        });

        if (isTableFlow) {
            if (!(hardValidation.front && !hardValidation.side)) {
                this.setState({
                    type: 'side',
                });
            }
        } else {
            setTimeout(() => this.sendMessage('front'), 500);
        }
    };

    saveSideFile = (file) => {
        console.log("saveSideFile", file);
        this.setState({
            type: null,
            sideImage: file,
        });

        setTimeout(() => this.sendMessage('side'), 500);
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
            isTableFlow,
        } = this.state;

        return (
            <div>
                {type && (
                    <Camera
                        type={type}
                        saveFront={this.saveFrontFile}
                        saveSide={this.saveSideFile}
                        isTableFlow={isTableFlow}
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
export default App;