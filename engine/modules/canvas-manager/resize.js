import ResizeALU from "./resize-alu.js";
import FrameHelper from "./frame.js";

const RESIZE_METHOD = "resize";

const INVALID_FIXED_SIZE = (width,height) => {
    throw Error(`Invalid fixed size: '${width}' by '${height}'`);
};

function Resize(canvasManager,modules) {
    const {sizeValues, sizeValuesReadonly} = ResizeALU.GetContainers();
    const canvas = modules.internal.canvas;
    const resize = ResizeALU.GetResizer(canvas,sizeValues);

    let deferred = false;
    const setDeferred = () => {
        deferred = true;
    };
    const setNotDeferred = () => {
        deferred = false;
    };
    this.setDeferred = setDeferred;
    setDeferred();

    const makeSize = (width,height) => {
        return {width,height};
    };
    const makeSizeClient = source => {
        return makeSize(
            source.clientWidth,source.clientHeight
        );
    };
    const makeSizeInner = source => {
        return makeSize(
            source.innerWidth,source.innerHeight
        );
    };

    const context = modules.internal.context;
    const notifySizeUpdate = () => {
        const frame = canvasManager.frame;
        if(!frame) return;
        FrameHelper.NotifyAll(frame,RESIZE_METHOD,[
            sizeValuesReadonly,context
        ]);
    };

    let fixedSize = null;
    this.tryUpdateSize = () => {
        if(!deferred) return;
        setNotDeferred();

        let size = fixedSize;
        if(!size) {
            const parent = canvas.parentElement;
            if(parent) {
                size = makeSizeClient(parent);
            } else {
                size = makeSizeInner(window);
            }
        }

        resize(size.width,size.height);
        notifySizeUpdate();
    };

    const validateFixedDimension = size => {
        return size && !isNaN(size);
    };

    this.setFixedSize = (width,height) => {
        const validWidth = validateFixedDimension(width);
        const validHeight = validateFixedDimension(height);
        if(!validWidth || !validHeight) {
            INVALID_FIXED_SIZE(width,height);
        }
        fixedSize = makeSize(width,height);
        setDeferred();
    };

    this.setFullSize = () => {
        if(fixedSize) {
            setDeferred();
        }
        fixedSize = null;
    };

    this.installDOM = () => {
        window.addEventListener("resize",setDeferred);
    };
    
    canvasManager.size = sizeValuesReadonly;

    Object.freeze(this);
}
export default Resize;
