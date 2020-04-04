import ParticleTypes from "./particle-types.js";
import EvalulationHelper from "./evalulation-helper.js";
const {Default} = ParticleTypes;
const {EvaulationTable} = EvalulationHelper;

const DEFAULT_SIZE = Default.size;
const DEFAULT_COLOR = Default.color;
const DEFAULT_COUNT = Default.count;
const DEFAULT_SCALE = Default.scale;
const DEFAULT_START = Default.start;
const DEFAULT_DRIFT = Default.drift;
const DEFAULT_DURATION = Default.duration;
const PARTICLE_BUFFER_SIZE = Default.bufferSize;

const BAD_BUFFER_SIZE = size => {
    throw Error(`Buffer size must be at least 2! ${size} is too small.`);
};

function Emitter({
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
    count = DEFAULT_COUNT,
    scale = DEFAULT_SCALE,
    start = DEFAULT_START,
    drift = DEFAULT_DRIFT,
    duration = DEFAULT_DURATION,
    bufferSize = PARTICLE_BUFFER_SIZE
}) {
    const evalTable = new EvaulationTable(
        size,color,count,scale,start,drift,duration,bufferSize
    );

    let particleCount = evalTable.count();
    if(particleCount < 1) particleCount = 1;

    const bufferStride = evalTable.bufferSize();
    if(bufferStride < 2) BAD_BUFFER_SIZE(bufferStride);

    const bufferArraySize = bufferStride * particleCount;
    const particles = new Array(bufferArraySize);
    let particleTime, particleColor, particleSize

    const reset = () => {
        const {duration, color, size, start} = evalTable;

        particleTime = duration();
        particleColor = color();
        particleSize = size();

        let i = 0;
        do {
            start(particles,i); i += bufferStride;
        } while(i < bufferArraySize);
    };
    reset();

    let firing = false, startTime = null, fireCallback = null, finished = false;

    const sendCallback = async () => {
        if(!fireCallback) return; fireCallback();
    };

    drift = evalTable.drift;

    this.render = (context,x,y,{now,delta}) => {
        if(!firing || finished) return;
        let t = (now - startTime) / particleTime;
        if(t < 0) {
            t = 0;
        } else if(t > 1) {
            finished = true; sendCallback(); return;
        }

        const particleScale = evalTable.scale(t);

        context.fillStyle = particleColor;
        context.beginPath();

        delta /= 1000;

        const size = particleSize * particleScale;
        const halfSize = size / 2;
        x -= halfSize; y -= halfSize;

        let i = 0;
        do {
            drift(particles,i,delta,t);
            context.rect(
                x+particles[i],
                y+particles[i+1],
            size,size);

            i += bufferStride;
        } while(i < bufferArraySize);

        context.fill();
    };

    this.fire = callback => {
        if(finished) {
            finished = false; firing = false; reset();
        }
        if(firing) return;
        fireCallback = callback;
        firing = true;
        startTime = performance.now();
    };
}
export default Emitter;
