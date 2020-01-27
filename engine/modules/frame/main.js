import Constants from "../../internal/constants.js";
const inputRoutes = Constants.InputRoutes;

const KEY_UP = inputRoutes.keyUp;
const KEY_DOWN = inputRoutes.keyDown;
const INPUT = inputRoutes.input;
const INPUT_GAMEPAD = inputRoutes.inputGamepad;
const FRAME_SIGNATURE = Constants.FrameSignature;

const INPUT_GAMEPAD_ALREADY_EXISTS = () => {
    throw Error("Gamepad input method already exists for base frame, cannot use managed gamepad");
};
const INVALID_PARAMETERS = () => {
    throw Error("Frame parameters must be an array, not array-like or data type");
};

import KeyBind from "./key-bind.js";
import ManagedGamepad from "./managed-gamepad.js";

function DefineProxy(target,propertyName,proxy) {
    let value = null;
    const propertyValue = target[propertyName];
    if(propertyValue) {
        value = (...parameters) => proxy(propertyValue,...parameters);
    }
    Object.defineProperty(target,propertyName,{value:value,enumerable:true});
}

function installManagedGamepad(gamepadSettings) {
    const managedGamepad = new ManagedGamepad(gamepadSettings);
    if(this[INPUT_GAMEPAD]) {
        INPUT_GAMEPAD_ALREADY_EXISTS();
    }
    Object.defineProperty(this,INPUT_GAMEPAD,{
        value: managedGamepad.pollingFilter.bind(null,this)
    });
}
function installKeyBinds(keyBinds) {
    const keyBind = new KeyBind(keyBinds);
    DefineProxy(this,KEY_DOWN,keyBind.keyFilter);
    DefineProxy(this,KEY_UP,keyBind.keyFilter);
    DefineProxy(this,INPUT,keyBind.keyFilter);
}
function validateParameters(parameters) {
    if(!parameters) return;
    if(!Array.isArray(parameters)) INVALID_PARAMETERS();
}
function Frame({
    base,parameters,
    gamepad=true,
    keyBinds=null
}) {
    validateParameters(parameters);
    this.render = missingRenderMethod;
    this.opaque = true;
    this.child = null;
    base.apply(this,parameters);
    if(gamepad) {
        installManagedGamepad.call(this,gamepad);
    }
    if(keyBinds) {
        installKeyBinds.call(this,keyBinds);
    }
}

function sendMessage(target,message,data) {
    const endpoint = target[message];
    if(endpoint) {
        endpoint.apply(target,data);
    }
}
function missingRenderMethod(context,size) {
    context.fillStyle = "black";
    context.fillRect(0,0,size.width,size.height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.font = "16px sans-serif";
    context.fillText("Missing Render Method",size.halfWidth,size.halfHeight);
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
        settings = {
            base: settings
        };
    }
    return new Frame(settings);
};
Object.freeze(Frame);

export default Frame;
