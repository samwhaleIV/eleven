import MakeEngineNamespace from "./internal/engine-namespace.js";

import CanvasManager from "./modules/canvas-manager.js";
import ResourceManager from "./modules/resource-manager.js";

export default MakeEngineNamespace([
    CanvasManager,
    ResourceManager
]);
