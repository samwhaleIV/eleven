import Resize from "./resize.js";
import Render from "./render.js";
import Internal from "./internal.js";
import Input from "./input.js";
import Gamepad from "./gamepad.js";
import Mouse from "./mouse.js";

const MODULES_LIST = [
    Internal,Resize,Gamepad,Mouse,Input,Render
];

function GetModules(canvasManager) {
    const modules = new Object();

    MODULES_LIST.forEach(module => {
        const name = module.name.toLowerCase();
        modules[name] = new module(canvasManager,modules);
    });

    Object.freeze(modules);
    return modules;
}
function InstallModulesDOM(modules) {
    Object.values(modules).forEach(module => {
        if(!module.installDOM) {
            return;
        }
        module.installDOM();
    });
}

function CanvasManager() {
    const modules = GetModules(this);
    Object.freeze(this);
    InstallModulesDOM(modules);
}

export default CanvasManager;
