/* For explanation of variable names see './variables.md' */

const VELOCITY_BUFFER_SIZE = 4;
const GRAVITY_ACCEL_RATE = 0.05;

const directionLookup = Object.freeze({
    0: "up", 1: "right", 2: "down", 3: "left"
});

const typeDefaults = {
    duration: 750, count: 20, color: "white", size: 8, bufferSize: 2, scale: tInverse
};
const customProperties = Object.keys(typeDefaults);

const applyTypeDefaults = type => {
    for(let i = 0;i<customProperties.length;i++) {
        const property = customProperties[i];
        if(!(property in type) || (!type[property] && isNaN(property))) {
            type[property] = typeDefaults[property];
        }
    }
    return type;
};

function GetType(type,data) {
    if(!type in types) INVALID_TYPE(type);
    return applyTypeDefaults(types[type](data));
}

const INVALID_TYPE = type => {
    throw Error(`'${type}' is an invalid particle base type!`);
};

const range = max => {
    return max * 2 * Math.random() - max;
};
const rangePositive = max => {
    return max * Math.random();
};

const getRange = max => {
    const double = max * 2;
    return () => double * Math.random() - max;
};
const getRangePositive = max => {
    return () => rangePositive(max);
};
const getRangeJitter = (base,jitter) => {
    const double = jitter * 2;
    return () => {
        return base + Math.random() * double - jitter;
    };
};
const getRangeJitterPositive = (base,jitter) => {
    return () => {
        return base + Math.random() * jitter;
    }
};

const velocityStartCustom = (x,y,xv,yv) => {
    return (p,i) => {
        p[i] = x(), p[i+1] = y(); p[i+2] = xv(), p[i+3] = yv();
    };
};

const velocityStart = (x,y,xv,yv) => {
    return (p,i) => {
        p[i] = range(x), p[i+1] = range(y);
        p[i+2] = range(xv), p[i+3] = range(yv);
    };
};

const gravityStart = (x,y,xv,base,jitter) => {
    return velocityStartCustom(
        getRange(x),getRange(y),getRange(xv),
        getRangeJitterPositive(base,jitter)
    );
};

const directionalStart = (direction,x,y,xv,yv) => {
    switch(direction) {
        default:
        case "up":    xv = getRange(xv), yv = getRangePositive(-yv); break;
        case "down":  xv = getRange(xv), yv = getRangePositive(yv);  break;

        case "left":  xv = getRangePositive(-xv), yv = getRange(yv); break;
        case "right": xv = getRangePositive(xv),  yv = getRange(yv); break;
    }
    return velocityStartCustom(getRange(x),getRange(y),xv,yv);
};

const driftBase = (p,i,d) => {
    p[i] += p[i+2] * d, p[i+1] += p[i+3] * d;
};

const nonlinearDrift_X = xt => {
    return (p,i,d,t) => {
        p[i] += p[i+2] * d * xt(t), p[i+1] += p[i+3] * d;
    };
};
const nonlinearDrift_Y = yt => {
    return (p,i,d,t) => {
        p[i] += p[i+2] * d, p[i+1] += p[i+3] * d * yt(t);
    };
};
const nonlinearDrift_XY = (xt,yt) => {
    return (p,i,d,t) => {
        p[i] += p[i+2] * d * xt(t), p[i+1] += p[i+3] * d * yt(t);
    };
};
const nonlinearDrift_T = tf => {
    return (p,i,d,t) => {
        t = tf(t), p[i] += p[i+2] * d * t, p[i+1] += p[i+3] * d * t;
    };
};

const nonlinearDrift = ({
    xt, yt, tf
}) => {
    if(tf) {
        if(!xt && !yt) return nonlinearDrift_T(tf);
        if(!xt) xt = tf; if(!yt) yt = tf; //Default to tf
    }
    if(xt && yt) return nonlinearDrift_XY(xt,yt);

    else if(xt && !yt) return nonlinearDrift_X(xt);
    else if(yt && !xt) return nonlinearDrift_Y(yt);

    return driftBase; //Fallback to linear drift for no parameters
};

const gravityDrift = rate => {
    return nonlinearDrift({tf: t => 1 + t * rate});
};

function tInverse(t) {
    return 1 - t;
}

function TypeBase(size,color,count,duration,scale,start,drift) {
    return {
        size,color,count,duration,start,scale,drift,
        bufferSize: VELOCITY_BUFFER_SIZE
    };
}

const types = Object.freeze({

    Base: function BaseType({
        x=0,y=0,xv=100,yv=100,size,color,count,duration,scale
    }) {
        return TypeBase(
            size,color,count,duration,scale,
        velocityStart(x,y,xv,yv),driftBase);
    },

    Gravity: function GravityType({
        x=100,y=50,xv=200,size=9,color,count,duration=1500,
        rate=0.05,gravity=100,jitter=500,scale
    }) {
        if(!rate) rate = GRAVITY_ACCEL_RATE;
        return TypeBase(
            size,color,count,duration,scale,
        gravityStart(x,y,xv,gravity,jitter),gravityDrift(rate));
    },

    Directional: function DirectionalType({
        direction,x=0,y=0,xv=100,yv=100,size,color,count,duration,scale
    }) {
        if(typeof direction === "number") {
            direction = directionLookup[direction];
        }
        return TypeBase(
            size,color,count,duration,scale,
        directionalStart(direction,x,y,xv,yv),driftBase);
    }

});

export default GetType;
