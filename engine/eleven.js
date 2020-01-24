import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/main.js";
import ResourceManager from "./modules/resource-manager/main.js";
import { GetFrame } from "./modules/frame/main.js";

export default Install([
    Singleton({
        module: CanvasManager,
        deferInstantiation: true
    }),
    Singleton({
        module: ResourceManager,
        deferInstantiation: true
    }),
    GetFrame
]);
