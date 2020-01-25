import Constants from "../../internal/constants.js";
const inputRoutes = Constants.InputRoutes;

const KEY_UP = inputRoutes.keyUp;
const KEY_DOWN = inputRoutes.keyDown;
const INPUT = inputRoutes.input;
const INPUT_GAMEPAD = inputRoutes.inputGamepad;

const INPUT_GAMEPAD_ALREADY_EXISTS = () => {
    throw Error("Gamepad input method already exists for base frame, cannot use managed gamepad");
};

import KeyBind from "./key-bind.js";
import ManagedGamepad from "./managed-gamepad.js";

function DefineProxy(target,propertyName,proxy) {
    let value = null;
    const propertyValue = target[propertyName];
    if(propertyValue) {
        value = (...parameters) => proxy(propertyValue,...parameters);
    }
    Object.defineProperty(target,propertyName,{value:value});
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

function Frame({
    base,parameters,
    managedGamepad=true,
    keyBinds=null
}) {
    this.child = null;
    base.apply(this,parameters);

    if(managedGamepad) {
        installManagedGamepad.call(this,managedGamepad);
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
function GetFrame(settings) {
    return new Frame(settings);
}
export default Frame;
export { Frame, GetFrame };
