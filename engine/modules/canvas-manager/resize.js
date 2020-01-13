import FrameHelper from "./frame.js";

const RESIZE_METHOD = "resize";
const FULL_SIZE_CLASS = "full";

function Resize(canvasManager,modules) {
    const sizeValues = new Object();
    const sizeValuesReadonly = new Object();

    const sizeValueTypes = [
        "width","height","halfWidth","halfHeight",
        "doubleWidth","doubleHeight","quarterWidth","quarterHeight",
        "horizontalRatio","verticalRatio","largestDimension","smallestDimension",
        "greaterWidth","greaterHeight","equalDimensions","unequalDimensions"
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

    let deferred = false;

    const updateSize = () => {
        deferred = true;
    };

    const resize = (function(
        sizeValues,canvas,context,sizeValuesReadonly,
        canvasManager,resizeMethod
    ){
        return (width,height) => {
    
            canvas.width = width; canvas.height = height;
            sizeValues.width = width; sizeValues.height = height;
            sizeValues.doubleWidth = width * 2; sizeValues.doubleHeight = height * 2;
            sizeValues.halfWidth = width / 2; sizeValues.halfHeight = height / 2;
            sizeValues.quarterWidth = width / 4; sizeValues.quarterHeight = height / 4;
            sizeValues.horizontalRatio = width / height;sizeValues.verticalRatio = height / width;

            const greaterWidth = width >= height;
            sizeValues.greaterHeight = !greaterWidth;
            sizeValues.greaterWidth = greaterWidth;
    
            if(greaterWidth) {
                sizeValues.largestDimension = width;
                sizeValues.smallestDimension = height;
            } else {
                sizeValues.largestDimension = height;
                sizeValues.smallestDimension = width;
            }
    
            const equalDimensions = width === height;
            sizeValues.equalDimensions = equalDimensions;
            sizeValueTypes.equalDimensions = !equalDimensions;

            const frame = canvasManager.frame;
            if(!frame) return;
            FrameHelper.NotifyAll(frame,resizeMethod,sizeValuesReadonly,context);
        };
    })(
        sizeValues,canvas,context,sizeValuesReadonly,
        canvasManager,RESIZE_METHOD
    );

    let fixedSize = false;

    this.tryUpdateSize = () => {
        if(fixedSize) return;
        if(!deferred) return;
        deferred = false;
        resize(window.innerWidth,window.innerHeight);
    };

    this.setFixedSize = (width,height) => {
        fixedSize = true;
        resize(width,height);
        canvas.classList.remove(FULL_SIZE_CLASS);
    };

    this.setFullSize = () => {
        if(fixedSize) {
            deferred = true;
        }
        fixedSize = false;
        canvas.classList.add(FULL_SIZE_CLASS);
    };

    this.installDOM = () => {
        window.addEventListener("resize",updateSize);
    };

    Object.freeze(this);
    updateSize();

    canvasManager.size = sizeValuesReadonly;
}
export default Resize;
