const LOG_PREFIX = "Canvas manager";

const RENDER_LOOP_ALREADY_PAUSED = () => {
    throw Error("Render loop already paused");
};
const RENDER_LOOP_ALREADY_STARTED = () => {
    throw Error("Render loop already paused");
};
const MISSING_FRAME = () => {
    throw Error("Cannot start rendering, there is no frame to render");
};
const INVALID_FRAME = frame => {
    throw Error(`Invalid frame '${frame}'`);
};
const CANVAS_NOT_IN_DOM = () => {
    throw Error("Cannot start rendering, the canvas element is not attached to the DOM");
};

let firstTime = true;
const LOG_LOOP_STARTED = () => {
    console.log(`${LOG_PREFIX}: ${firstTime?"Started":"Resumed"} render loop`);
    firstTime = false;
};
const LOG_LOOP_PAUSED = () => {
    console.log(`${LOG_PREFIX}: Paused render loop`);
};

function Render(canvasManager,modules) {

    let paused = true;
    let internalFrame = null;
    let renderFrame = null;

    const getDeepRenderer = () => {
        return internalFrame.deepRender.bind(internalFrame);
    };

    function setFrame(frame) {
        if(!frame) {
            INVALID_FRAME(frame);
        }
        internalFrame = frame;
        renderFrame = getDeepRenderer();
    }
    function getFrame() {
        return internalFrame;
    }

    const time = Object.seal({
        now: 0,
        delta: 0
    });
    const readonlyTime = Object.freeze(Object.defineProperties(new Object(),{
        now: {get: function() {return time.now}},
        delta: {get: function() {return time.delta}}
    }));

    (function({renderData,pollInput,tryUpdateSize}){
        let animationFrame = null;
        const render = timestamp => {
            if(paused) return;
            tryUpdateSize();
            pollInput(readonlyTime);
            time.delta = timestamp - time.now;
            time.now = timestamp;
            renderFrame(renderData);
            animationFrame = requestAnimationFrame(render);
        };
        canvasManager.start = ({target,frame,markLoaded}) => {
            if(!paused) {
                RENDER_LOOP_ALREADY_STARTED();
            }

            if(target) {
                canvasManager.target = target;
            }
            modules.internal.trySetDefaultTarget();
            if(!modules.internal.canvasInDOM()) {
                CANVAS_NOT_IN_DOM();
            }

            if(frame) {
                setFrame(frame);
            }
            if(!internalFrame) {
                MISSING_FRAME();
            }

            paused = false;
            animationFrame = requestAnimationFrame(render);
            LOG_LOOP_STARTED();
            if(markLoaded) {
                canvasManager.markLoaded();
            }
        };
        canvasManager.pause = () => {
            if(paused) {
                RENDER_LOOP_ALREADY_PAUSED();
            }
            paused = true;
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
            LOG_LOOP_PAUSED();
        };
        canvasManager.setFrame = setFrame;
        canvasManager.getFrame = getFrame;
    })({
        renderData: [
            modules.internal.context,
            canvasManager.size,
            readonlyTime
        ],
        pollInput: modules.input.poll,
        tryUpdateSize: modules.resize.tryUpdateSize
    });

    Object.defineProperties(canvasManager,{
        paused: {
            enumerable: true,
            get: function() {
                return paused;
            }
        },
        frame: {
            enumerable: true,
            get: getFrame,
            set: setFrame
        }
    });
    
    Object.freeze(this);
}
export default Render;
