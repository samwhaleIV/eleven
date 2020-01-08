const Constants = Object.freeze({
    globalModuleName: "Eleven",
    isSingleton: Symbol("isSingleton"),
    manualSingleton: Symbol("manualSingleton"),
    deferredSingleton: Symbol("deferredSingleton"),
    bitmapSettings: Object.freeze({
        imageOrientation: "none",
        premultiplyAlpha: "premultiply",
        colorSpaceConversion: "default",
        resizeQuality: "pixelated"
    })
});
export default Constants;
