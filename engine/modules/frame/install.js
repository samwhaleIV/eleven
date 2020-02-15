import Constants from "../../internal/constants.js";
import Frame from "./main.js";

const FRAME_SIGNATURE = Constants.FrameSignature;

const INVALID_FRAME = frame => {
    throw Error(`Invalid frame '${frame}'`);
};
const BAD_SIGNATURE = frame => {
    throw Error(`Frame '${frame}' has incorrect signature. Does frame inherit Eleven.Frame's prototype?`);
};
const BAD_FRAME_LOADER = frameLoader => {
    throw Error(`Frame loader '${frameLoader}' of type '${typeof frameLoader}' is not a valid load function`);
};

async function InstallFrame(frame,parameters) {
    if(!frame) {
        INVALID_FRAME(frame);
    }
    if(typeof frame === "function") {
        frame = Frame.create({
            base: frame,
            parameters: parameters
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
    return frame;
}
export default InstallFrame;
