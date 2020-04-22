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

import UVTCLighting from "./modules/world2d/uvtc-lighting.js";
import UVTCReflection from "./modules/world2d/uvtc-reflection.js";

import TileCollision from "./modules/collision/tile-collision.js";
import CollisionLayer from "./modules/collision/collision-layer.js";

import PlayerController from "./modules/world2d/player/player-controller.js";
import InstallHitBox from "./modules/sprite/hitbox.js";

import AnimatedSprite from "./modules/sprite/animated-sprite.js";
import WaterBackground from "./modules/world2d/water-background.js";
import TileSprite from "./modules/sprite/tile-sprite.js";

import TextLayer from "./modules/text/text-layer.js";
import SpeechBox from "./modules/text/speech-box.js";
import WorldImpulse from "./modules/world2d/world-impulse.js";

import MultiLayer from "./internal/multi-layer.js";
import FrameTimeout from "./internal/frame-timeout.js";
import CollisionTypes from "./modules/collision/collision-types.js";
import Singleton from "./packer/singleton.js";

import TextSprite from "./modules/sprite/text-sprite.js";
import DOMInterface from "./modules/dom-interface/dom-interface.js";

import ParticleSystem from "./modules/particle-system/particle-system.js";
import Fader from "./modules/fader/fader.js";
import Faders from "./modules/fader/faders.js";

import ParseGrid2DMap from "./modules/grid2D/tile-renderer/parse.js";

import {GlyphTable} from "./modules/text/glyph-table.js";

globalThis.delay = duration => new Promise(resolve => setTimeout(resolve,duration));
globalThis.frameDelay = FrameTimeout;

const NamespaceTable = (name,sourceTable,readOnly=true) => {
    return Singleton({
        name: name,
        module: function() {
            Object.entries(sourceTable).forEach(([property,value]) => {
                this[property] = value;
            });
            if(readOnly) Object.freeze(this);
        }
    });
};

const Eleven = Install([
    Singleton({
        module: CanvasManager,
        deferInstantiation: false
    }),
    Singleton({
        module: ResourceManager,
        deferInstantiation: false
    }),
    Singleton({
        module: AudioManager,
        deferInstantiation: false
    }),
    Singleton({
        module: DOMInterface,
        deferInstantiation: true,
    }),
    Frame,
    MultiLayer,
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
    InstallHitBox,
    AnimatedSprite,
    WaterBackground,
    TileSprite,
    TextSprite,
    TextLayer,
    SpeechBox,
    WorldImpulse,
    ParseGrid2DMap,
    FrameTimeout,
    NamespaceTable("CollisionTypes",CollisionTypes),
    Singleton({
        module: ParticleSystem,
        deferInstantiation: false
    }),
    Fader,
    Singleton({
        module: Faders
    }),
    Singleton({
        module: GlyphTable
    })
]);

export default Eleven;
