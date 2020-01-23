import engine from "../engine/eleven.js";
import ManagedGamepad from "../engine/modules/frame/managed-gamepad.js";

Namespace.makeGlobal(engine);

const canvasManager = engine.CanvasManager;
const managedGamepad = new ManagedGamepad();

function TestFrame() {
    this.inputGamepad = managedGamepad.getPollingFilter(this);
    this.keyDown = event => {
        console.log("Key down:",event);
    };
    this.keyUp = event => {
        return;
    };
    this.render = (context,size) => {
        context.fillStyle = "red";
        context.fillRect(0,0,size.width,size.height);
    }
}

canvasManager.start({
    frame: new TestFrame(),
    markLoaded: true
});
