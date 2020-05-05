const maxIntensity = 100;
const getIntenseColor = (r,g,b,intensity) => {
    return `rgba(${r},${g},${b},${intensity/maxIntensity})`;
}
const getColoredStops = (r,g,b,intensity) => {
    return [
        [getIntenseColor(r,g,b,intensity),0],
        [getIntenseColor(r,g,b,0),1]
    ];
}
const getWhiteStops = intensity => {
    return getColoredStops(255,255,255,intensity);
}
const getBlackStops = intensity => {
    return getColoredStops(0,0,0,intensity);
}

const GRADIENT_MANIFEST = Object.freeze([
    getBlackStops(100),
    getWhiteStops(100),
    getBlackStops(50),
    getWhiteStops(50),
    getBlackStops(25),
    getWhiteStops(25),
    getBlackStops(75),
    getWhiteStops(75),
    getColoredStops(147,255,255,75),
    getColoredStops(255,0,0,75),
    getColoredStops(0,255,0,75),
    getColoredStops(219,166,105,75),
    getColoredStops(255,233,0,75),
    getColoredStops(124,55,255,75),
    getColoredStops(198,0,151,75),
    getWhiteStops(10),
    getWhiteStops(0)
]);

export default GRADIENT_MANIFEST;
