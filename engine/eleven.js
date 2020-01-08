import Constants from "./helper/constants.js";
import Modules from "./helper/modules.js";

import CanvasManager from "./modules/canvas-manager.js";
import ResourceManager from "./modules/resources/resource-manager.js";

function GetConstant(name) {
    return Constants[name];
}

const modules = [
    CanvasManager,
    ResourceManager,
    GetConstant
];

Modules.Install({
    target: globalThis,
    name: Constants.globalModuleName,
    modules: modules
});
