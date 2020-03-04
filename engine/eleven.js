import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/canvas-manager.js";
import ResourceManager from "./modules/resource-manager/resource-manager.js";
import AudioManager from "./modules/audio-manager/audio-manager.js";
import Frame from "./modules/frame/frame.js";
import Grid2D from "./modules/grid2D/grid2D.js";
import SpriteLayer from "./modules/sprite/sprite-layer.js";
import KeyBind from "./modules/key-bind/key-bind.js";
import ManagedGamepad from "./modules/managed-gamepad/managed-gamepad.js";
import SpriteFollower from "./modules/sprite/sprite-follower.js";
import UVTCLighting from "./modules/uvtc-lighting/uvtc-lighting.js";
import Dispatcher from "./modules/dispatcher/dispatcher.js";
import UVTCReflection from "./modules/uvtc-reflection/uvtc-reflection.js";

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
    ManagedGamepad,
    SpriteFollower,
    UVTCLighting,
    Singleton({
        module: UVTCReflection,
        deferInstantiation: true
    }),
    Dispatcher
]);

export default Eleven;
