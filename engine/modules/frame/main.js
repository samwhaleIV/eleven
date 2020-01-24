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
    Object.defineProperty(target,propertyName,{
        value: value, writable: false, configurable: false
    });
}

function Frame({
    base,parameters,
    managedGamepad=true,
    keyBinds=null
}) {
    const gamepadSettings = managedGamepad;

    this.child = null;
    base.apply(this,parameters);

    if(gamepadSettings) {
        const managedGamepad = new ManagedGamepad(gamepadSettings);
        if(INPUT_GAMEPAD in this) {
            INPUT_GAMEPAD_ALREADY_EXISTS();
        }
        Object.defineProperty(this,INPUT_GAMEPAD,{
            value: managedGamepad.pollingFilter.bind(null,this),
            writable: false,configurable: false
        });
    }
    if(keyBinds) {
        const keyBind = new KeyBind(keyBinds);
        DefineProxy(this,KEY_DOWN,keyBind.keyFilter);
        DefineProxy(this,KEY_UP,keyBind.keyFilter);
        DefineProxy(this,INPUT,keyBind.keyFilter);
    }

    //todo make frame helper functions private

    this.getDeepest = () => {
        let frame = this;
        let child = frame.child;
        while(child) {
            frame = child;
            child = frame.child;
        }
        return frame;
    };

    this.messageAll = (message,...data) => {
        let frame = this;
        let child = frame.child;

        while(child) {
            if(frame[message]) {
                frame[message].apply(frame,data);
            }

            frame = child;
            child = frame.child;
        }

        if(frame[message]) {
            frame[message].apply(frame,data);
        }
    };

    this.message = (message,...data) => {
        const frame = this.getDeepest();
        if(frame[message]) {
            frame[message].apply(frame,data);
        }
    };

    this.deepRender = data => {
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
    };
}
export default Frame;
