import Constants from "../../internal/constants.js";
import Frame from "./main.js";

const FRAME_SIGNATURE = Constants.FrameSignature;
const LOADED_SYMBOL = Symbol("LoadedSymbol");

const INVALID_FRAME = frame => {
    throw Error(`Invalid frame '${frame}'`);
};
const BAD_SIGNATURE = frame => {
    throw Error(`Frame '${frame}' has incorrect signature. Does frame inherit Eleven.Frame's prototype?`);
};
const BAD_FRAME_LOADER = frameLoader => {
    throw Error(`Frame loader '${frameLoader}' of type '${typeof frameLoader}' is not a valid load function`);
};
const UNEXPECTED_PARAMETERS = () => {
    throw Error("Parameter use is only valid when supplying an uninstantiated frame constructor");
};

async function InstallFrame(frame,parameters) {
    if(LOADED_SYMBOL in frame) {
        if(frame.load === frame[LOADED_SYMBOL]) {
            if(parameters) UNEXPECTED_PARAMETERS();
            return frame;
        }
    }
    if(!frame) {
        INVALID_FRAME(frame);
    }
    if(typeof frame === "function") {
        frame = Frame.create({
            base: frame, parameters: parameters
        });
    } else if(parameters !== undefined) {
        UNEXPECTED_PARAMETERS();
    }
    if(frame.signature !== FRAME_SIGNATURE) {
        BAD_SIGNATURE(frame);
    }
    const frameLoader = frame.load;
    if(frameLoader !== undefined) {
        if(typeof frameLoader !== "function") {
            BAD_FRAME_LOADER(frameLoader);
        }
        await frameLoader.call(frame);
    }
    Object.defineProperty(frame,LOADED_SYMBOL,{value:frame.load});
    return frame;
}
export default InstallFrame;
