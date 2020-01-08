import InstallGlobalNamespace from "./internal/namespace.js";

import CanvasManager from "./modules/canvas-manager.js";
import ResourceManager from "./modules/resource-manager.js";

const modules = [
    CanvasManager,
    ResourceManager
];

InstallGlobalNamespace({
    name: "Eleven",
    modules: modules
});
