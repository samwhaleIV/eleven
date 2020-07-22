import Constants from "../../internal/constants.js";

const constants = Constants.InputRoutes;

const KEY_DOWN = constants.keyDown;
const KEY_UP = constants.keyUp;
const INPUT = constants.input;
const INPUT_GAMEPAD = constants.inputGamepad;
const MODIFIER_CHANGED = constants.modifierChanged;

function tryPreventDefault(event) {
    if(event.preventDefault) {
        event.preventDefault();
    }
}
function MakeAssociative(array) {
    return Object.freeze(array.reduce((keys,value)=>{
        keys[value] = true; return keys;
    },new Object()));
}

const SYSTEM_KEYS = MakeAssociative([
    "F12","F11","F5"
]);

const NON_PASSTHROUGH_ELEMENTS = MakeAssociative([
    "INPUT","SELECT"
]);

const ALT_KEYS = ["AltLeft","AltRight"];
const CTRL_KEYS = ["ControlLeft","ControlRight"];
const SHIFT_KEYS = ["ShiftLeft","ShiftRight"];

const MODIFIER_KEYS = MakeAssociative([
    ALT_KEYS,CTRL_KEYS,SHIFT_KEYS
].flat());

const hasKey = (downKeys,[left,right]) => {
    return left in downKeys || right in downKeys;
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
    canvasManager.downKeys = downKeys;

    const getFrameSafe = () => {
        let frame = canvasManager.getFrame();
        if(!frame) return null;
        frame = frame.getDeepest();
        return frame;
    };
    const getFrame = () => {
        return canvasManager.getFrame().getDeepest();
    };

    const summariseKeyEvent = event => {
        return {
            code: event.code,
            repeat: event.repeat,
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
        const keyTarget = document.body;

        const targetMatches = ({target}) => {
            if(target.tagName in NON_PASSTHROUGH_ELEMENTS) {
                return target === keyTarget;
            }
            return true;
        };
    
        keyTarget.addEventListener("keydown",function(event){
            if(!targetMatches(event)) return;

            downKeys[event.code] = summariseKeyEvent(event);
            sendKeyDown(event);
        });
        keyTarget.addEventListener("keyup",function(event){
            if(!targetMatches(event)) return;

            delete downKeys[event.code];
            sendKeyUp(event);
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
                frame[INPUT](downKeys,time);
            }
            const gamepadData = gamepadPoll();
            if(gamepadData && frame[INPUT_GAMEPAD]) {
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
