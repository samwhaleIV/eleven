import Emitter from "./emitter.js";
import ParticleTypes from "./particle-types.js";

const POOL_FIRE_RATE = 500;

const {DynamicTypes} = ParticleTypes;

const INVALID_PARTICLE_TYPE = name => {
    throw Error(`Invalid particle type '${name}!`);
};
const INVALID_DYNAMIC_TYPE = name => {
    throw Error(`Invalid dynamic particle type '${name}'!`);
};

const getEmitter = data => {
    if(typeof data === "string") {
        const name = data;
        data = ParticleTypes[name];
        if(!data || name === "DynamicTypes") {
            INVALID_PARTICLE_TYPE(name);
        }
    }
    if(!data) {
        data = ParticleTypes.Default;
    }
    return new Emitter(data);
};

const delay = duration => new Promise(resolve=>setTimeout(resolve,duration));

function EmitterPool(data,count) {
    if(count < 1) count = 0;

    const emitters = new Array(count);
    for(let i = 0;i<count;i++) {
        emitters[i] = getEmitter(data);
    }

    this.fire = interval => {
        let i = 0;
        if(interval) {
            do {
                setTimeout(emitters[i].fire,interval*i);
                i++;
            } while(i < count);
        } else {
            do {
                emitters[i].fire();
                i++;
            } while(i < count);
        }
    };

    this.render = (context,x,y,time) => {
        let i = 0;
        do {
            emitters[i].render(context,x,y,time);
            i++;
        } while(i<count);
    };

    let streaming = false;

    this.stream = (fireRate,pauseTime) => {
        if(isNaN(fireRate)) fireRate = POOL_FIRE_RATE;
        if(isNaN(pauseTime)) pauseTime = 0;
        if(streaming) return;
        streaming = true;
        (async () => {
            while(true) {
                if(!streaming) return;
                this.fire(fireRate);
                await delay(fireRate * count + pauseTime);
            }
        })();
    };

    this.stopStream = () => {
        const wasStreaming = streaming;
        streaming = false;
        return wasStreaming;
    };

    Object.freeze(this);
}

function ParticleSystem() {
    this.getEmitter = getEmitter;
    this.getEmitterPool = (data,count) => {
        return new EmitterPool(data,count);
    };

    this.getType = (name,...parameters) => {
        const type = DynamicTypes[name];
        if(!type) INVALID_DYNAMIC_TYPE(name);
        return type(...parameters);
    };

    this.types = ParticleTypes;
    Object.freeze(this);
}
export default ParticleSystem;
