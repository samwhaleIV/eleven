import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const CanvasManager = engine.CanvasManager;
const Frame = engine.frame;

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

CanvasManager.start({
    frame: Frame.create({
        base: TestFrame,
        gamepad: {
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
