import ResizeALU from "./resize-alu.js";
import FrameHelper from "./frame.js";

const RESIZE_METHOD = "resize";
const DEFAULT_SIZE_SCALE = 1;
const FULL_SIZE_CLASS = "full-size";

const INVALID_FIXED_SIZE = (width,height) => {
    throw Error(`Invalid fixed size: '${width}' by '${height}'`);
};
const INVALID_SIZE_SCALE = scale => {
    throw Error(`Invalid size scale '${scale}'`);
};
const SIZE_ALREADY_RESET = () => {
    console.warn("Canvas size is still default or it has already been reset");
};

function Resize(canvasManager,modules) {

    const {sizeValues, sizeValuesReadonly} = ResizeALU.GetContainers();
    const canvas = modules.internal.canvas;
    const resize = ResizeALU.GetResizer(canvas,sizeValues);
    canvasManager.size = sizeValuesReadonly;

    let deferred = false;
    const setDeferred = () => {
        deferred = true;
    };
    const setNotDeferred = () => {
        deferred = false;
    };
    this.setDeferred = setDeferred;

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
    let sizeScale = DEFAULT_SIZE_SCALE;
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

        const width = size.width * sizeScale;
        const height = size.height * sizeScale;

        resize(width,height);
        notifySizeUpdate();
    };

    const validateFixedDimension = size => {
        return size && !isNaN(size);
    };

    const registerFullSizeCSS = () => {
        canvas.classList.add(FULL_SIZE_CLASS);
    };
    const removeFullSizeCSS = () => {
        canvas.classList.remove(FULL_SIZE_CLASS);
    };
    registerFullSizeCSS();

    const setFixedSize = (width,height) => {
        const validWidth = validateFixedDimension(width);
        const validHeight = validateFixedDimension(height);
        if(!validWidth || !validHeight) {
            INVALID_FIXED_SIZE(width,height);
        }
        fixedSize = makeSize(width,height);
        sizeScale = 1;
        removeFullSizeCSS();
        setDeferred();
    };

    const validateScale = scale => {
        if(!scale || isNaN(scale)) {
            INVALID_SIZE_SCALE(scale);
        }
    };

    const setFullSize = scale => {
        validateScale(scale);
        if(fixedSize || scale !== sizeScale) {
            setDeferred();
        }
        sizeScale = scale;
        registerFullSizeCSS();
        fixedSize = null;
    };

    let lastSize = null;
    canvasManager.resetSize = function() {
        if(!lastSize) {
            SIZE_ALREADY_RESET();
            return;
        }
        lastSize = null;
        setFullSize(DEFAULT_SIZE_SCALE);
    };
    canvasManager.setSize = function(width,height) {
        if(lastSize) {
            lastSize.width = width;
            lastSize.height = height;
        } else {
            lastSize = Object.seal({width,height})
        }
        setFixedSize(
            lastSize.width,lastSize.height
        );
    };
    canvasManager.setScale = function(scale) {
        validateScale(scale);
        if(lastSize) {
            setFixedSize(
                lastSize.width * scale,
                lastSize.height * scale
            );
        } else {
            setFullSize(scale);
        }
    };

    this.installDOM = () => {
        window.addEventListener("resize",setDeferred);
    };

    Object.freeze(this);
}
export default Resize;
