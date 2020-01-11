import FrameHelper from "./frame.js";

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

    function SetFrame(frame) {
        if(!frame) {
            INVALID_FRAME(frame);
        }
        internalFrame = frame;
        renderFrame = FrameHelper.RenderFrame.bind(internalFrame);
    }
    function GetFrame() {
        return internalFrame;
    }

    (function(context,size,pollInput){
        let animationFrame;
        function render(timestamp) {
            pollInput();
            if(paused) {
                return;
            }
            renderFrame(context,timestamp,size);
            animationFrame = requestAnimationFrame(render);
        }
        canvasManager.start = () => {
            if(!internalFrame) {
                MISSING_FRAME();
            }
            if(!paused) {
                RENDER_LOOP_ALREADY_STARTED()
            }
            paused = false;
            modules.resize.updateIfDeferred();
            animationFrame = requestAnimationFrame(render);
            LOG_LOOP_STARTED();
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
        canvasManager.setFrame = SetFrame;
        canvasManager.getFrame = GetFrame;
    })(modules.internal.context,canvasManager.size,modules.input.poll);

    Object.defineProperties(canvasManager,{
        paused: {
            get: function() {
                return paused;
            }
        },
        frame: {
            get: GetFrame,
            set: SetFrame
        }
    });
    
    Object.freeze(this);
}
export default Render;
