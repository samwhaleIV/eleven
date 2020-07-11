import EvaulationTable from "./evaluation-table.js";

const BAD_BUFFER_SIZE = size => {
    throw Error(`Buffer size must be at least 2! ${size} is too small.`);
};

const getParticleCount = evalTable => {
    let particleCount = evalTable.count();
    if(particleCount < 1) particleCount = 1;
    return particleCount;
};

const getBufferSize = evalTable => {
    const bufferSize = evalTable.bufferSize();
    if(bufferSize < 2) BAD_BUFFER_SIZE(bufferSize);
    return bufferSize;
};

function Emitter({
    size,color,count,scale,start,drift,duration,bufferSize
}) {
    const evalTable = new EvaulationTable(
        size,color,count,scale,start,drift,duration,bufferSize
    );

    const particleCount = getParticleCount(evalTable);
    bufferSize = getBufferSize(evalTable);

    const bufferArraySize = bufferSize * particleCount;
    const particles = new Array(bufferArraySize);

    let particleTime, particleColor, particleSize

    const reset = () => {
        const {duration, color, size, start} = evalTable;

        particleTime = duration();
        particleColor = color();
        particleSize = size();

        let i = 0;
        do {
            start(particles,i); i += bufferSize;
        } while(i < bufferArraySize);
    };
    reset();

    //Emitter state variables...
    let firing = false, startTime = null, fireCallback = null, finished = false;

    const sendCallback = async () => {
        if(!fireCallback) return; fireCallback();
    };

    drift = evalTable.drift;

    scale = 1;
    Object.defineProperty(this,"scale",{
        get: () => scale,
        set: value => scale = value,
        enumerable: true
    });

    this.render = (context,x,y,{now,delta}) => {
        if(!firing || finished) return;
        let t = (now - startTime) / particleTime;
        if(t < 0) {
            t = 0;
        } else if(t > 1) {
            finished = true; sendCallback(); return;
        }

        const transform = context.getTransform();

        const particleScale = evalTable.scale(t);

        context.fillStyle = particleColor;
        context.beginPath();

        delta /= 1000; //Converts frame time delta to a delta second (zero to one)

        const size = particleSize * particleScale;
        const halfSize = size / 2;

        context.translate(x-halfSize,y-halfSize);
        context.scale(scale,scale);

        let i = 0;
        do {
            drift(particles,i,delta,t);
            context.rect(
                particles[i],
                particles[i+1],
            size,size);

            i += bufferSize;
        } while(i < bufferArraySize);

        context.fill();
        context.setTransform(transform);
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

    Object.freeze(this);
}
export default Emitter;
