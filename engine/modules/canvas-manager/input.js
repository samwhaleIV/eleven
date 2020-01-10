import FrameHelper from "./frame.js";
import Constants from "../../internal/constants.js";

const constants = Constants.inputRoutes;

const KEY_DOWN = constants.keyDown;
const KEY_UP = constants.keyUp;
const INPUT = constants.input;
const INPUT_GAMEPAD = constants.inputGamepad;

function tryStopPropagation(event) {
    if(event.stopPropagation) {
        event.stopPropagation();
    }
}
function tryPreventDefault(event) {
    if(event.preventDefault) {
        event.preventDefault();
    }
}
function stopBubbling(event) {
    tryPreventDefault(event);
    tryStopPropagation(event);
}
function MakeAssociative(array) {
    return Object.freeze(array.reduce((keys,value)=>{
        keys[value] = true; return keys;
    },new Object()));
}

const SYSTEM_KEYS = MakeAssociative([
    "F12","F11","F5"
]);

const ALT_CODE = 18;
const CONTROL_CODE = 17;
const SHIFT_CODE = 16;
const META_LEFT = 91;
const META_RIGHT = 92;

const MODIFIER_CODES = MakeAssociative([
    SHIFT_CODE,CONTROL_CODE,ALT_CODE,META_LEFT,META_RIGHT
]);

function Input(canvasManager,modules) {

    const downKeys = {};

    const getDeepestFrameSafe = () => {
        let frame = canvasManager.frame;
        if(!frame) return null;
        frame = FrameHelper.GetDeepestFrame(frame);
        return frame;
    };
    const getDeepestFrame = () => {
        return FrameHelper.GetDeepestFrame(canvasManager.frame);
    };

    const summariseKeyEvent = event => {
        return {
            keyCode: event.keyCode,
            code: event.code,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        }
    };

    const sendKey = function(event) {
        if(canvasManager.paused) {
            return;
        }
        tryStopPropagation(event);
        const isSystem = event.code in SYSTEM_KEYS;
        if(isSystem) {
            return;
        }
        tryPreventDefault(event);
        const isModifier = event.keyCode in MODIFIER_CODES;
        if(isModifier) {
            return;
        }
        const frame = getDeepestFrameSafe();
        if(!frame) return;
        const inputTarget = frame[this];
        if(!inputTarget) return;
        inputTarget(summariseKeyEvent(event));
    };

    const sendKeyUp = sendKey.bind(KEY_UP);
    const sendKeyDown = sendKey.bind(KEY_DOWN);

    this.installDOM = () => {
        window.addEventListener("keydown",function(event){
            if(event.repeat) {
                stopBubbling(event);
                return;
            }
            downKeys[event.code] = summariseKeyEvent(event);
            sendKeyDown(event);
        },{
            capture: true
        });
        window.addEventListener("keyup",function(event){
            delete downKeys[event.code];
            sendKeyUp(event);
        },{
            capture: true
        });
        window.addEventListener("blur",function(){
            Object.values(downKeys).forEach(event => {
                delete downKeys[event.code];
                sendKeyUp(event);
            });
        });
    };

    (function(gamepadPoll){
        this.poll = () => { 
            const frame = getDeepestFrame();
            if(frame[INPUT]) {
                frame[INPUT](downKeys);
            }
            const gamepadData = gamepadPoll();
            if(!gamepadData) {
                return;
            }
            if(frame[INPUT_GAMEPAD]) {
                frame[INPUT_GAMEPAD](gamepadData);
            }
        };
    }).call(this,modules.gamepad.poll);

    Object.freeze(this);
}
export default Input;
