function CompositeProcessor(alphaContext) {
    alphaContext = alphaContext ? true : false;
    let width = 0, height = 0;

    Object.defineProperties(this,{
        width: {
            get: () => width,
            enumerable: true
        },
        height: {
            get: () => height,
            enumerable: true
        }
    });

    const resetDimensions = () => {
        const size = Eleven.CanvasManager.size;
        const newWidth = size.width;
        const newHeight = size.height;
        if(newWidth) width = newWidth;
        if(newHeight) height = newHeight;
    };

    const offscreenCanvas = new OffscreenCanvas(width,height);
    const offscreenContext = offscreenCanvas.getContext("2d",{alpha:alphaContext});
    const refreshCanvas = () => {
        resetDimensions();
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
    };

    let enabled = false;
    this.enable = () => enabled = true;
    this.disable = () => enabled = false;

    let mode = "source-over";
    this.setMode = compositeOperation => mode = compositeOperation;

    let xOffset = 0, yOffset = 0;
    this.setOffsets = (x,y) => {
        xOffset = x; yOffset = y;
    };

    this.resize = refreshCanvas;
    this.composite = (context,buffer,xOffset,yOffset,mode) => {
        context.save();
        context.globalCompositeOperation = mode;
        context.drawImage(
            buffer,0,0,width,height,
            xOffset,yOffset,width,height
        );
        context.restore();
    };
    this.render = context => {
        if(!enabled) {
            return;
        }
        if(alphaContext) {
            offscreenContext.clearRect(0,0,width,height);
        }
        offscreenContext.drawImage(
            context.canvas,0,0,width,height,0,0,width,height
        );
        this.composite(context,offscreenCanvas,xOffset,yOffset,mode);
    };
}
export default CompositeProcessor;
