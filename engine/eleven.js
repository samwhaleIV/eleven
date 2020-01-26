import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/main.js";
import ResourceManager from "./modules/resource-manager/main.js";
import Frame from "./modules/frame/main.js";

const Eleven = Install([
    Singleton({
        module: CanvasManager,
        deferInstantiation: true
    }),
    Singleton({
        module: ResourceManager,
        deferInstantiation: true
    }),
    Frame
]);

export default Eleven;
