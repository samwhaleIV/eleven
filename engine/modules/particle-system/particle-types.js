const DEFAULT_DURATION = 750;
const DEFAULT_COUNT = 100;
const PIXELS_PER_SECOND = 2000;
const DEFAULT_COLOR = "white";
const DEFAULT_SIZE = 8;
const DOUBLE_PIXELS_PER_SECOND = PIXELS_PER_SECOND * 2;
const DEFAULT_BUFFER_SIZE = 4;

const RandomVelocity = () => {
    return DOUBLE_PIXELS_PER_SECOND * Math.random() - PIXELS_PER_SECOND;
};
const RandomPolarized = value => {
    return value * Math.random() * 2 - value;
};

const velocityDrift = (particle,i,deltaSecond) => {
    let x = particle[i], y = particle[i+1];
    const xv = particle[i+2], yv = particle[i+3];

    x += xv * deltaSecond;
    y += yv * deltaSecond;

    particle[i] = x; particle[i+1] = y;
};

const getExpVelocityDrift = rate => {
    return (particle,i,deltaSecond,t) => {
        let x = particle[i], y = particle[i+1];
        const xv = particle[i+2], yv = particle[i+3];
    
        const exp = 1 + t * rate;
    
        x += xv * deltaSecond * exp * Math.random(); 
        y += yv * deltaSecond * exp;
    
        particle[i] = x; particle[i+1] = y;
    };
};

const linearTimeScale = t => 1 - t;

const GetGravity = color => {
    return {
        size: DEFAULT_SIZE + 2 * Math.random(),
        color: color,
        count: DEFAULT_COUNT,
        bufferSize: DEFAULT_BUFFER_SIZE,
        duration: DEFAULT_DURATION * 2,
        scale: linearTimeScale,
        drift: getExpVelocityDrift(0.05),
        start: (particle,i) => {
            particle[i] = RandomPolarized(100);
            particle[i+1] = RandomPolarized(50);
            particle[i+2] = RandomPolarized(200);
            particle[i+3] = Math.random() * 500 + 100
        }
    };
};

const ParticleTypes = Object.freeze({
    Default: {
        size: DEFAULT_SIZE,
        color: DEFAULT_COLOR,
        count: DEFAULT_COUNT,
        bufferSize: DEFAULT_BUFFER_SIZE,
        duration: DEFAULT_DURATION,
        scale: linearTimeScale,
        drift: velocityDrift,
        start: (particle,i) => {
            particle[i] = 0;
            particle[i+1] = 0;
            particle[i+2] = RandomVelocity();
            particle[i+3] = RandomVelocity();
        }
    },
    DynamicTypes: {
        Gravity: GetGravity
    }
});
export default ParticleTypes;
