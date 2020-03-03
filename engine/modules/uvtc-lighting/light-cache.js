import GradientManifest from "./gradient-manifest.js";

function LightCache() {

    const gradientCount = GradientManifest.length;
    const bufferCanvas = new OffscreenCanvas(0,0);
    const bufferContext = bufferCanvas.getContext("2d",{alpha:true});

    let gradientSize = null, gradientHalfSize = null, gradientQuarterSize = null;

    const render = (context,x,y,gradientID) => {
        context.drawImage(
            bufferCanvas,gradientID * gradientSize,0,
            gradientSize,gradientSize,
            x-gradientQuarterSize,
            y-gradientQuarterSize,
            gradientSize,gradientSize
        );
    };

    const clearBuffer = () => {
        bufferContext.clearRect(0,0,bufferCanvas.width,bufferCanvas.height);
    };

    const getRadialGradient = stops => {
        const radialGradient = bufferContext.createRadialGradient(
            gradientHalfSize,gradientHalfSize,
            0,gradientHalfSize,
            gradientHalfSize,gradientHalfSize
        );
        for(let i = 0;i < stops.length;i++) {
            const stop = stops[i];
            radialGradient.addColorStop(stop[1],stop[0]);
        }
        return radialGradient;
    };

    const renderGradient = (stops,x) => {
        const radialGradient = getRadialGradient(stops);
        bufferContext.fillStyle = radialGradient;

        bufferContext.translate(x,0);
        bufferContext.fillRect(0,0,gradientSize,gradientSize);
        bufferContext.translate(-x,0);
    };

    const renderGradients = () => {
        clearBuffer();
        for(let i = 0;i<gradientCount;i++) {
            const gradient = GradientManifest[i];
            const x = i * gradientSize;
            renderGradient(gradient,x);
        }
    };

    const cache = tileSize => {
        const newSize = tileSize * 2;
        if(gradientSize === newSize) return;

        gradientSize = newSize;
        gradientQuarterSize = gradientSize / 4;
        gradientHalfSize = tileSize;

        bufferCanvas.width = gradientSize * gradientCount;
        bufferCanvas.height = gradientSize;

        renderGradients();
    };

    this.cache = cache;
    this.render = render;
    Object.freeze(this);
}

export default LightCache;
