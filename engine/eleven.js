import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/main.js";
import ResourceManager from "./modules/resource-manager/main.js";
import AudioManager from "./modules/audio-manager/main.js";
import Frame from "./modules/frame/main.js";
import Grid2D from "./modules/grid2D/main.js";
import SpriteLayer from "./modules/sprite-layer/main.js";
import KeyBind from "./modules/key-bind/main.js";
import GamepadProcessor from "./modules/gamepad-processor/main.js";

const Eleven = Install([
    Singleton({
        module: CanvasManager,
        deferInstantiation: true
    }),
    Singleton({
        module: ResourceManager,
        deferInstantiation: true
    }),
    Singleton({
        module: AudioManager,
        deferInstantiation: true
    }),
    Frame,
    Grid2D,
    SpriteLayer,
    KeyBind,
    GamepadProcessor
]);

export default Eleven;
