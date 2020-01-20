import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/main.js";
import ResourceManager from "./modules/resource-manager/main.js";
import InputTranslator from "./modules/input-translator.js";
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
        module: InputTranslator,
        deferInstantiation: true
    }),
    Singleton({
        module: ManagedGamepad,
        deferInstantiation: true
    }),
]);
