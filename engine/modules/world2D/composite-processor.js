/*
  A relic from the ancient times... The time before, that was once, but not of here. Not of now.
*/

import Constants from "../../internal/constants.js";
const ENGINE_NAMESPACE = Constants.EngineNamespace;

function CompositeProcessor(transparent) {
    transparent = transparent ? true : false;
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
        //If you're looking for a render context bug, you're in the right place
        const engineNamespace = globalThis[ENGINE_NAMESPACE];
        const {size} = engineNamespace.CanvasManager;
        const newWidth = size.width;
        const newHeight = size.height;
        if(newWidth) width = newWidth;
        if(newHeight) height = newHeight;
    };

    const buffer = new OffscreenCanvas(width,height);
    const bufferContext = buffer.getContext("2d",{alpha:transparent});

    const refreshBuffer = () => {
        resetDimensions();
        buffer.width = width;
        buffer.height = height;
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

    this.resize = refreshBuffer;
    this.composite = (context,buffer,xOffset,yOffset,mode) => {
        const startOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = mode;
        context.drawImage(
            buffer,0,0,width,height,
            xOffset,yOffset,width,height
        );
        context.globalCompositeOperation = startOperation;
    };
    this.render = context => {
        if(!enabled) return;

        if(transparent) {
            bufferContext.clearRect(0,0,width,height);
        }
        bufferContext.drawImage(
            context.canvas,0,0,width,height,0,0,width,height
        );
        this.composite(context,buffer,xOffset,yOffset,mode);
    };
}
export default CompositeProcessor;
