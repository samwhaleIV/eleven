import Install from "./internal/install.js";

import CanvasManager from "./modules/canvas-manager/canvas-manager.js";
import ResourceManager from "./modules/resource-manager/resource-manager.js";
import AudioManager from "./modules/audio-manager/audio-manager.js";
import Frame from "./modules/frame/frame.js";
import Grid2D from "./modules/grid2D/grid2D.js";

import KeyBind from "./modules/frame/key-bind.js";
import ManagedGamepad from "./modules/managed-gamepad/managed-gamepad.js";

import SpriteLayer from "./modules/sprite/sprite-layer.js";
import SpriteFollower from "./modules/sprite/sprite-follower.js";
import DispatchRenderer from "./modules/grid2D/dispatch-renderer.js";

import UVTCLighting from "./modules/uvtc/uvtc-lighting.js";
import UVTCReflection from "./modules/uvtc/uvtc-reflection.js";

import TileCollision from "./modules/collision/tile-collision.js";
import CollisionLayer from "./modules/collision/collision-layer.js";

import PlayerController from "./modules/uvtc/player/player-controller.js";
import InstallHitBox from "./modules/sprite/hitbox.js";

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
    DispatchRenderer,
    CollisionLayer,
    TileCollision,
    PlayerController,
    InstallHitBox
]);

export default Eleven;
