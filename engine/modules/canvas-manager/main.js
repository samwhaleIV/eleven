import Submodule from "../../internal/submodule.js";

import Internal from "./internal.js";
import Resize from "./resize.js";
import Gamepad from "./gamepad.js";
import Mouse from "./mouse.js";
import Input from "./input.js";
import Render from "./render.js";
import BufferResize from "./buffer-resize.js";
import SizeControl from "./size-control.js";

const MODULES_LIST = [
    Internal,Resize,Gamepad,SizeControl,Mouse,Input,Render,BufferResize
];

function CanvasManager() {
    Submodule.call(this,MODULES_LIST,module => {
        if(!module.installDOM) return;
        module.installDOM();
    });
}

export default CanvasManager;
