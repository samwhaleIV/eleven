import Emitter from "./emitter.js";
import EmitterPool from "./emitter-pool.js";
import GetType from "./particle-creator.js";
import InstallBakedTypes from "./baked-types.js";

function ParticleSystem() {

    InstallBakedTypes(this);

    this.getEmitter = data => new Emitter(data);
    this.getPool = (data,count) => new EmitterPool(data,count);

    this.getType = GetType;

    Object.freeze(this);
}

export default ParticleSystem;
