import InstallFrame from "../frame/loader.js";

const LOG_PREFIX = "Canvas manager";
const MINIMUM_FPS = 15;
const MAX_FRAMETIME_DELTA = 1000 / MINIMUM_FPS;

const RENDER_LOOP_ALREADY_PAUSED = () => {
    throw Error("Render loop already paused");
};
const RENDER_LOOP_ALREADY_STARTED = () => {
    throw Error("Render loop already started");
};
const MISSING_FRAME = () => {
    throw Error("Cannot start rendering, there is no frame to render");
};
const CANVAS_NOT_IN_DOM = () => {
    throw Error("Cannot start rendering, the canvas element is not attached to the DOM");
};
const UNEXPECTED_PARAMETERS = () => {
    throw Error("Parameter use is only valid when supplying an uninstantiated frame constructor");
};
const SETTING_FRAME_IS_ASYNC = () => {
    console.warn("Setting a frame using the setter method is not advised because it is an asynchronous operation");
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

    const context = modules.internal.context;

    let paused = true;
    let internalFrame = null;
    let renderFrame = null;

    const getDeepRenderer = () => {
        return internalFrame.deepRender.bind(internalFrame);
    };

    async function setFrame(frame,parameters) {
        internalFrame = await InstallFrame(frame,parameters);
        renderFrame = getDeepRenderer();
    }
    function getFrame() {
        return internalFrame;
    }

    let now = 0, delta = 0;

    const readonlyTime = Object.freeze(Object.defineProperties(new Object(),{
        now: {
            get: () => now,
            enumerable: true
        },
        delta: {
            get: () => delta,
            enumerable: true
        }
    }));

    const renderData = [
        context,
        canvasManager.size,
        readonlyTime
    ];

    canvasManager.time = readonlyTime;

    const pollInput = modules.input.poll;
    const tryUpdateSize = modules.resize.tryUpdateSize;

    let animationFrame = null;

    const maxDelta = MAX_FRAMETIME_DELTA;
    const render = timestamp => {
        tryUpdateSize();
        delta = Math.min(timestamp-now,maxDelta);
        now = timestamp;
        pollInput(readonlyTime);
        renderFrame(renderData);
        animationFrame = requestAnimationFrame(render);
    };
    canvasManager.start = async data => {
        let {
            target,frame,parameters,markLoaded=true,markLoading=true
        } = data || {};
        if(!paused) {
            RENDER_LOOP_ALREADY_STARTED();
        }

        if(markLoading) {
            canvasManager.markLoading();
        }

        if(target) {
            canvasManager.target = target;
        }
        modules.internal.trySetDefaultTarget();
        if(!modules.internal.canvasInDOM()) {
            CANVAS_NOT_IN_DOM();
        }

        if(frame) {
            await setFrame(frame,parameters);
        } else if(parameters) {
            UNEXPECTED_PARAMETERS();
        }
        if(!internalFrame) {
            MISSING_FRAME();
        }

        paused = false;
        now = performance.now();
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

    Object.defineProperties(canvasManager,{
        frame: {
            get: getFrame,
            set: value => {
                SETTING_FRAME_IS_ASYNC();
                setFrame(value);
            },
            enumerable: true
        },
        paused: {
            enumerable: true,
            get: function() {
                return paused;
            },
            set: value => {
                value = Boolean(value);
                if(value) {
                    canvasManager.pause();
                } else {
                    canvasManager.start();
                }
            }
        }
    });

    Object.freeze(this);
}
export default Render;
