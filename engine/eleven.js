import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/main.js";
import ResourceManager from "./modules/resource-manager/main.js";
import KeyBind from "./modules/key-bind.js";
import ManagedGamepad from "./modules/managed-gamepad.js";

export default Install([
    Singleton({
        module: CanvasManager,
        deferInstantiation: true
    }),
    Singleton({
        module: ResourceManager,
        deferInstantiation: true
    }),
    Singleton({
        module: KeyBind,
        deferInstantiation: true
    }),
    Singleton({
        module: ManagedGamepad,
        deferInstantiation: true
    }),
]);
