import engine from "../engine/eleven.js";
import ManagedGamepad from "../engine/modules/frame/managed-gamepad.js";

Namespace.makeGlobal(engine);

const canvasManager = engine.CanvasManager;

function TestFrame() {
    this.keyDown = event => {
        console.log("Key down:",event);
    };
    this.keyUp = event => {
        //console.log("Key up  :",event);
    };
    this.render = (context,size) => {
        context.fillStyle = "red";
        context.fillRect(0,0,size.width,size.height);
    }
}

canvasManager.start({
    frame: engine.GetFrame({
        base: TestFrame,
        managedGamepad: {
            binds: {
                Up: "TestUp",
                Down: "TestDown",
                Left: "TestLeft",
                Right: "TestRight",
            },
            compositeLeftAxis: true,
            compositeRightAxis: false
        }
    }),
    markLoaded: true
});
