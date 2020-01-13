import FrameHelper from "./frame.js";

const RESIZE_METHOD = "resize";

function Resize(canvasManager,modules) {
    const sizeValues = new Object();
    const sizeValuesReadonly = new Object();

    const sizeValueTypes = [
        "width","height",
        "halfWidth","halfHeight",
        "doubleWidth","doubleHeight",
        "quarterWidth","quarterHeight",
        "horizontalRatio","verticalRatio",
        "largestDimension","smallestDimension",
        "greaterWidth","greaterHeight",
        "equalDimensions","unequalDimensions"
    ];

    sizeValueTypes.forEach(valueType => {
        sizeValues[valueType] = null;
        Object.defineProperty(sizeValuesReadonly,valueType,{
            get: function(){return sizeValues[valueType]}
        });
    });

    Object.seal(sizeValues);
    Object.freeze(sizeValuesReadonly);

    const canvas = modules.internal.canvas;
    const context = modules.internal.context;

    const buffer = new OffscreenCanvas(0,0);
    const bufferContext = buffer.getContext("2d",{alpha:true});

    const doubleBuffer = new OffscreenCanvas(0,0);
    const doubleBufferContext = doubleBuffer.getContext("2d",{alpha:true});

    let deferred = false;

    const updateSize = () => {
        deferred = true;
    };

    const resize = (function(
        window,buffer,bufferContext,
        doubleBuffer,doubleBufferContext,sizeValues,
        canvas,context,sizeValuesReadonly,
        canvasManager,resizeMethod
    ){
        return () => {
            const frame = canvasManager.frame;

            const width = window.innerWidth;
            const height = window.innerHeight;
    
            if(frame.doubleResizeBuffer) {
                if(!buffer.width || !buffer.height) {
                    buffer.width = width;
                    buffer.height = height;
                }
        
                bufferContext.drawImage(canvas,0,0);
        
                if(width > buffer.width || height > buffer.height) {
                    doubleBuffer.width = buffer.width;
                    doubleBuffer.height = buffer.height;
                    doubleBufferContext.drawImage(buffer,0,0);
        
                    buffer.width = width;
                    buffer.height = height;
        
                    bufferContext.drawImage(doubleBuffer,0,0);
                    doubleBuffer.width = 0;
                    doubleBuffer.height = 0;
                }
            } else {
                buffer.width = width;
                buffer.height = height;
                bufferContext.drawImage(canvas,0,0);
            }
    
            canvas.width = width;
            canvas.height = height;
    
            sizeValues.width = width;
            sizeValues.height = height;
    
            sizeValues.doubleWidth = width * 2;
            sizeValues.doubleHeight = height * 2;
    
            sizeValues.halfWidth = width / 2;
            sizeValues.halfHeight = height / 2;
    
            sizeValues.quarterWidth = width / 4;
            sizeValues.quarterHeight = height / 4;
    
            sizeValues.horizontalRatio = width / height;
            sizeValues.verticalRatio = height / width;
    
            if(width >= height) {
                sizeValues.greaterHeight = false;
                sizeValues.greaterWidth =  true;
                sizeValues.largestDimension =  width;
                sizeValues.smallestDimension = height;
            } else {
                sizeValues.greaterHeight = true;
                sizeValues.greaterWidth =  false;
                sizeValues.largestDimension =  height;
                sizeValues.smallestDimension = width;
            }
    
            const equalDimensions = width === height;
    
            sizeValues.equalDimensions = equalDimensions;
            sizeValueTypes.equalDimensions = !equalDimensions;

            FrameHelper.NotifyAll(frame,resizeMethod,sizeValuesReadonly,context,buffer);
        };
    })(
        window,buffer,bufferContext,
        doubleBuffer,doubleBufferContext,sizeValues,
        canvas,context,sizeValuesReadonly,
        canvasManager,RESIZE_METHOD
    );

    this.tryUpdateSize = () => {
        if(!deferred) return;
        deferred = false;
        resize();
    };

    this.installDOM = () => {
        window.addEventListener("resize",updateSize);
    };

    Object.freeze(this);
    updateSize();

    canvasManager.size = sizeValuesReadonly;
}
export default Resize;
