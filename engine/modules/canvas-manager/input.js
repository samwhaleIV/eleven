import FrameHelper from "./frame.js";

function Input(canvasManager,modules) {
    //FrameHelper.GetDeepestFrame(canvasManager.frame);
    this.poll = () => {
        //only for gamepad events...
    };
    this.installDOM = () => {
        const canvas = modules.internal.canvas;
        //canvas.addEventListener("")
    };
    Object.freeze(this);
}
export default Input;


//Managed and unmanaged:
    //altClickDown
    //altClickUp
    //pointerUpdate

    //clickDown
    //clickUp

//Managed:
    //inputDown (includes gamepad mappings)
    //inputUp   (includes gamepad mappings)

    //flag: disableJoysticks

//Unmanaged:
    //rawInput (table of keys down and up)
    //rawInputGamepad (table of gamepad data)

