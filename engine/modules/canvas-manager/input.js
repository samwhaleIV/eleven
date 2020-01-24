import Constants from "../../internal/constants.js";

const constants = Constants.InputRoutes;

const KEY_DOWN = constants.keyDown;
const KEY_UP = constants.keyUp;
const INPUT = constants.input;
const INPUT_GAMEPAD = constants.inputGamepad;
const MODIFIER_CHANGED = constants.modifierChanged;

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


const ALT_KEYS = ["AltLeft","AltRight"];
const CTRL_KEYS = ["ControlLeft","ControlRight"];
const SHIFT_KEYS = ["ShiftLeft","ShiftRight"];

const MODIFIER_KEYS = MakeAssociative([
    ALT_KEYS,CTRL_KEYS,SHIFT_KEYS
].flat());

const hasKey = (downKeys,set) => {
    return set[0] in downKeys || set[1] in downKeys;
};

const getModifierData = downKeys => {
    return {
        shiftKey: hasKey(downKeys,SHIFT_KEYS),
        altKey: hasKey(downKeys,ALT_KEYS),
        ctrlKey: hasKey(downKeys,CTRL_KEYS)
    };
};

function Input(canvasManager,modules) {

    const downKeys = {};

    const getFrameSafe = () => {
        let frame = canvasManager.frame;
        if(!frame) return null;
        frame = frame.getDeepest();
        return frame;
    };
    const getFrame = () => {
        return canvasManager.frame.getDeepest();
    };

    const summariseKeyEvent = event => {
        return {
            code: event.code,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        }
    };

    const sendKey = function(action,event) {
        if(canvasManager.paused) {
            return;
        }
        tryStopPropagation(event);
        const isSystem = event.code in SYSTEM_KEYS;
        if(isSystem) {
            return;
        }
        tryPreventDefault(event);
        const frame = getFrameSafe();
        if(!frame) return;
        const isModifier = event.code in MODIFIER_KEYS;
        if(isModifier) {
            const modifierChanged = frame[MODIFIER_CHANGED];
            if(!modifierChanged) return;
            modifierChanged(getModifierData(downKeys));
            return;
        }
        const inputTarget = frame[action];
        if(!inputTarget) return;
        inputTarget(summariseKeyEvent(event));
    };

    const sendKeyUp = sendKey.bind(null,KEY_UP);
    const sendKeyDown = sendKey.bind(null,KEY_DOWN);

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

    (function({
        gamepadPoll,getModifierData,updateModifiers
    }){
        this.poll = time => {
            updateModifiers(getModifierData(downKeys));
            const frame = getFrame();
            if(frame[INPUT]) {
                frame[INPUT](downKeys);
            }
            const gamepadData = gamepadPoll();
            if(!gamepadData) {
                return;
            }
            if(frame[INPUT_GAMEPAD]) {
                frame[INPUT_GAMEPAD](gamepadData,time);
            }
        };
    }).call(this,{
        gamepadPoll: modules.gamepad.poll,
        getModifierData: getModifierData,
        updateModifiers: modules.mouse.updateModifiers
    });

    Object.freeze(this);
}
export default Input;
