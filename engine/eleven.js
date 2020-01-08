import InstallGlobalNamespace from "./internal/namespace.js";
import Constants from "./internal/constants.js";

import CanvasManager from "./modules/canvas-manager.js";
import ResourceManager from "./modules/resource-manager.js";

const modules = [
    CanvasManager,
    ResourceManager
];

InstallGlobalNamespace({
    name: Constants.globalModuleName,
    modules: modules
});
