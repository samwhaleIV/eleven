import Constants from "../../internal/constants.js";
import InstallFrame from "./loader.js";
import MissingRender from "./missing-render.js";

const FRAME_SIGNATURE = Constants.FrameSignature;

const INVALID_PARAMETERS = () => {
    throw Error("Frame parameters must be an array, not array-like or data type");
};
const BAD_BASE = base => {
    throw Error(`Base '${base}' of type '${typeof base}' is an invalid frame base, must be "function"`);
};

function validateParameters(parameters) {
    if(!parameters) return;
    if(!Array.isArray(parameters)) INVALID_PARAMETERS();
}
function validateBase(base) {
    if(typeof base === "function") return;
    BAD_BASE(base);
}
function validateFrameData(base,parameters) {
    validateBase(base);
    validateParameters(parameters);
}
function setDefaultProperties(target) {
    target.render = MissingRender;
    target.opaque = true;
    target.child = null;
}
function installBase(target,base,parameters) {
    validateFrameData(base,parameters);
    base.apply(target,parameters);
}

function Frame({
    base,parameters,
}) {
    setDefaultProperties(this);
    installBase(this,base,parameters);
}

function sendMessage(target,message,data) {
    const endpoint = target[message];
    if(endpoint) endpoint.apply(target,data);
}
Frame.prototype.getDeepest = function() {
    let frame = this;
    let child = frame.child;
    while(child) {
        frame = child;
        child = frame.child;
    }
    return frame;
}
Frame.prototype.deepRender = function(data) {
    const stack = [];
    let stackStart = 0;

    let frame = this;
    let child = frame.child;

    while(child) {
        stack.push(frame);
        if(frame.opaque) stackStart = stack.length - 1;

        frame = child;
        child = frame.child;
    }
    stack.push(frame);
    if(frame.opaque) stackStart = stack.length - 1;

    let i = stackStart;
    while(i<stack.length) {
        frame = stack[i];
        frame.render.apply(frame,data);
        i++;
    }
}
Frame.prototype.setChild = async function(frame,...parameters) {
    const shouldRemove = !Boolean(frame);
    if(shouldRemove) {
        this.child = null;
        return null;
    }
    if(typeof frame === "function") {
        frame = new Frame({
            base: frame, parameters: parameters,
            gamepad: false, keyBinds: false
        });
    }
    await Frame.load(frame);
    this.child = frame;
    return frame;
}
Frame.prototype.message = function(message,...data) {
    sendMessage(this,message,data);
}
Frame.prototype.messageDeepest = function(message,...data) {
    sendMessage(this.getDeepest(),message,data);
}
Frame.prototype.messageAll = function(message,...data) {
    let frame = this;
    let child = frame.child;

    while(child) {
        sendMessage(frame,message,data);

        frame = child;
        child = frame.child;
    }

    sendMessage(frame,message,data);
}
Frame.prototype.signature = FRAME_SIGNATURE;
Object.freeze(Frame.prototype);

Frame.create = function(settings) {
    if(typeof settings === "function") {
        settings = {base: settings};
    }
    return new Frame(settings);
}
Frame.load = async function(frame) {
    frame = await InstallFrame(frame);
    return frame;
}
Object.freeze(Frame);

export default Frame;
