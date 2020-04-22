const RoundingBase = 32;

const RoundLow = value => Math.floor(value * RoundingBase) / RoundingBase;
const RoundHigh = value => Math.ceil(value * RoundingBase) / RoundingBase;
const RoundNear = value => Math.round(value * RoundingBase) / RoundingBase;

const FPEModulator = Object.freeze({
    RoundLow,RoundHigh,RoundNear
});

export default FPEModulator;
export {RoundNear, RoundHigh, RoundLow};
