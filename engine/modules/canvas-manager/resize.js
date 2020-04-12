import ResizeALU from "./resize-alu.js";

const RESIZE_METHOD = "resize";
const DEFAULT_SIZE_SCALE = 1;
const FULL_SIZE_CLASS = "full-size";

const INVALID_FIXED_SIZE = (width,height) => {
    throw Error(`Invalid fixed size: '${width}' by '${height}'`);
};
const INVALID_SIZE_SCALE = scale => {
    throw Error(`Invalid size scale '${scale}'`);
};

function Resize(canvasManager,modules) {

    const sizeValues = ResizeALU.GetContainer();
    const canvas = modules.internal.canvas;
    const resize = ResizeALU.GetResizer(canvas,sizeValues);
    canvasManager.size = sizeValues;

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
    const sizeChangeData = Object.freeze({
        context, size: sizeValues
    });

    const notifySizeUpdate = () => {
        const frame = canvasManager.getFrame();
        if(!frame) return;
        frame.messageAllFrames(RESIZE_METHOD,sizeChangeData);
    };

    let fixedSize = null;
    let boxFill = false;
    let fixFill = false;
    
    const getParentSize = () => {
        let parentSize;
        const parent = canvas.parentElement;
        if(parent) {
            parentSize = makeSizeClient(parent);
        } else {
            parentSize = makeSizeInner(window);
        }
        return parentSize;
    };

    const removeFill = () => {
        canvas.style.top = "";
        canvas.style.left = "";
        canvas.style.width = "";
        canvas.style.height = "";
    };
    const setFill = (x,y,width,height) => {
        canvas.style.top = x + "px";
        canvas.style.left = y + "px";
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    };

    const updateFixFill = parentSize => {
        setFill(0,0,parentSize.width,parentSize.height);
    };

    const updateBoxFill = parentSize => {
        const horizontalRatio = parentSize.width / parentSize.height;
        if(horizontalRatio > sizeValues.horizontalRatio) {
            const height = parentSize.height;
            const width = sizeValues.horizontalRatio * height;
            setFill(0,(parentSize.width/2) - (width/2),width,height);
        } else {
            const width = parentSize.width;
            const height = sizeValues.verticalRatio * width;
            setFill((parentSize.height/2) - (height/2),0,width,height);
        }
    };

    const updateFill = parentSize => {
        if(!fixedSize) {
            removeFill();
            return;
        }
        if(!parentSize) {
            parentSize = getParentSize();
        }
        if(fixFill) {
            updateFixFill(parentSize);
        } else {
            updateBoxFill(parentSize);
        }
    };

    let sizeScale = DEFAULT_SIZE_SCALE;
    this.tryUpdateSize = () => {
        if(!deferred) return;
        setNotDeferred();

        let size = fixedSize;
        let parentSize;
        if(!size) {
            parentSize = getParentSize();
            size = parentSize;
        }

        const width = size.width * sizeScale;
        const height = size.height * sizeScale;

        resize(width,height);
        notifySizeUpdate();
        if(boxFill || fixFill) {
            updateFill(parentSize);
        }
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
        if(!lastSize) return;
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
    canvasManager.enableBoxFill = function() {
        if(boxFill) return;
        boxFill = true;
        fixFill = false;
        updateFill();
    };
    canvasManager.enableFixFill = function() {
        if(fixFill) return;
        fixFill = true;
        boxFill = false;
        updateFill();
    };
    canvasManager.disableFill = function() {
        if(!fixFill && !boxFill) return;
        fixFill = false;
        boxFill = false;
        removeFill();
    };

    this.installDOM = () => {
        window.addEventListener("resize",setDeferred);
    };

    Object.freeze(this);
}
export default Resize;
