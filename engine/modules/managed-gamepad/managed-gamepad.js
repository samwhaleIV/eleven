import Constants from "../../internal/constants.js";
import GamepadBinds from "./gamepad-binds.js";
import DeadzoneScale from "./deadzone-scale.js";
import EncodeAxes from "./axis-code.js";
import ValidateSettings from "./settings-validator.js";

const inputRoutes = Constants.InputRoutes;
const KEY_DOWN = inputRoutes.keyDown;
const KEY_UP = inputRoutes.keyUp;
const INPUT_GAMEPAD = inputRoutes.inputGamepad;

const CODE_ORDER = GamepadBinds.CodeOrder;
const KEYS = GamepadBinds.Keys;
const INVERSE_CODES = GamepadBinds.CodesInverse;
const CODES = GamepadBinds.Codes;

const TRIGGER_KEY = GamepadBinds.TriggerKey;
const JOYSTICK_KEY = GamepadBinds.JoystickMove;
const DIRECTION_KEY = GamepadBinds.DirectionKey;

const LEFT_X_AXIS = 0;
const LEFT_Y_AXIS = 1;

const RIGHT_X_AXIS = 2
const RIGHT_Y_AXIS = 3;

const getImpulseEvent = (impulse,{code,key}) => {
    return {
        impulse: impulse, code, key,
        ctrlKey: false, shiftKey: false, altKey: false
    };
};

const getInverseCode = code => {
    return INVERSE_CODES[code];
};

function ButtonState(code) {
    this.code = code;
    this.key = KEYS[code];
    const inverseCode = getInverseCode(code);
    this.inverseCode = inverseCode;
    this.pressed = false;
    this.pressedTime = null;
    this.repeatTime = null;
    Object.seal(this);
}

function AxisState(codes) {
    this.key = JOYSTICK_KEY;
    this.codes = codes;
    this.code = null;
    Object.defineProperty(this,"inverseCode",{
        get: () => getInverseCode(this.code)
    });
    this.pressed = false;
    this.pressedTime = null;
    this.repeatTime = null;
    Object.seal(this);
}

function ManagedGamepad(settings) {

    settings = ValidateSettings(settings);

    let keyDown = null;
    let keyUp = null;
    let inputGamepad = null;
    Object.defineProperties(this,{
        [KEY_DOWN]: {
            get: () => keyDown,
            set: value => keyDown = value,
            enumerable: true
        },
        [KEY_UP]: {
            get: () => keyUp,
            set: value => keyUp = value,
            enumerable: true
        },
        [INPUT_GAMEPAD]: {
            get: () => inputGamepad,
            set: value => inputGamepad = value,
            enumerable: true
        }
    });

    const repeatDelay = settings.repeatDelay;
    const repeatRate = settings.repeatRate;

    const repeatTriggers = settings.repeatTriggers;
    const repeatAxes = settings.repeatAxes;
    const repeatButtons = settings.repeatButtons;

    const manageLeftAxis = settings.manageLeftAxis;
    const manageRightAxis = settings.manageRightAxis;

    const triggerThreshold = settings.triggerThreshold;
    const axisDeadzone = settings.axisDeadzone;
    const binds = settings.binds;

    const buttonCount = CODE_ORDER.length;
    const buttonStates = new Array(buttonCount);
    for(let i = 0;i<buttonCount;i++) {
        buttonStates[i] = new ButtonState(CODE_ORDER[i]);
    }

    const {leftAxisState, rightAxisState} = (function({
        compositeLeftAxis, compositeRightAxis
    }){
        let compositeAxisCodes = null;
        if(compositeLeftAxis || compositeRightAxis) {
            compositeAxisCodes = {
                up: CODES.Up,
                down: CODES.Down,
                left: CODES.Left,
                right: CODES.Right
            };
        }
        const leftCodes = compositeLeftAxis ? compositeAxisCodes : {
            up: CODES.LeftJoystickUp,
            down: CODES.LeftJoystickDown,
            left: CODES.LeftJoystickLeft,
            right: CODES.LeftJoystickRight
        };
        const rightCodes = compositeRightAxis ? compositeAxisCodes : {
            up: CODES.RightJoystickUp,
            down: CODES.RightJoystickDown,
            left: CODES.RightJoystickLeft,
            right: CODES.RightJoystickRight
        };
        const leftAxisState = new AxisState(leftCodes);
        const rightAxisState = new AxisState(rightCodes);
        if(compositeLeftAxis) {
            leftAxisState.key = DIRECTION_KEY;
        }
        if(compositeRightAxis) {
            rightAxisState.key = DIRECTION_KEY;
        }
        return {leftAxisState, rightAxisState};
    })(settings);

    const sendKey = (down,buttonState) => {
        const target = down ? keyDown : keyUp;
        if(!target) return;
        const impulse = binds[buttonState.inverseCode];
        target(getImpulseEvent(impulse,buttonState));
    };
    
    const processKeyRepeat = (buttonState,timestamp) => {
        let send = false;
        if(buttonState.repeatTime !== null) {
            if(timestamp > buttonState.repeatTime + repeatRate) {
                buttonState.repeatTime = timestamp;
                send = true;
            }
        } else if(timestamp > buttonState.pressedTime + repeatDelay) {
            buttonState.repeatTime = timestamp;
            send = true;
        }
        if(send) {
            sendKey(true,buttonState);
        }
    };

    const processButtonState = (buttonState,isPressed,doRepeat,timestamp) => {
        if(isPressed !== buttonState.pressed) {
            const sendMode = isPressed;
            buttonState.pressed = sendMode;

            const pressedTime = sendMode ? timestamp : null;
            buttonState.pressedTime = pressedTime;

            if(!sendMode) {
                buttonState.repeatTime = null;
            }
            sendKey(sendMode,buttonState);
        } else if(isPressed && doRepeat) {
            processKeyRepeat(buttonState,timestamp);
        }
    };

    const nonZeroAxes = (xAxis,yAxis) => {
        return xAxis !== 0 || yAxis !== 0;
    };

    const processAxis = (axisState,xAxis,yAxis,timestamp) => {
        xAxis = DeadzoneScale(axisDeadzone,xAxis);
        yAxis = DeadzoneScale(axisDeadzone,yAxis);
        let isPressed = nonZeroAxes(xAxis,yAxis);
        const newCode = EncodeAxes(xAxis,yAxis,axisState.codes);
        if(newCode !== null) {
            if(axisState.code !== newCode) {
                if(axisState.pressed) {
                    sendKey(false,axisState);
                }
                axisState.pressed = false;
            }
            axisState.code = newCode;
        }
        processButtonState(axisState,isPressed,repeatAxes,timestamp);
    };

    const processGamepadAxes = (axes,timestamp) => {
        if(manageLeftAxis) {
            const x = axes[LEFT_X_AXIS];
            const y = axes[LEFT_Y_AXIS];
            processAxis(leftAxisState,x,y,timestamp);
        }
        if(manageRightAxis) {
            const x = axes[RIGHT_X_AXIS];
            const y = axes[RIGHT_Y_AXIS];
            processAxis(rightAxisState,x,y,timestamp);
        }
    };

    const buttonIsPressed = (button,isTrigger) => {
       return isTrigger ? button.value > triggerThreshold : button.pressed;
    };
    const poll = ({buttons,axes},time) => {
        const timestamp = time.now;
        let buttonIndex = 0;
        const downKeys = {};
        do {
            const button = buttons[buttonIndex];
            const buttonState = buttonStates[buttonIndex];

            const isTrigger = buttonState.key === TRIGGER_KEY;
            const isPressed = buttonIsPressed(button,isTrigger);

            const code = buttonState.inverseCode;
            if(code in binds) {
                const impulse = binds[code];
                if(isPressed) downKeys[impulse] = getImpulseEvent(impulse,buttonState);
                const doRepeat = isTrigger ? repeatTriggers : repeatButtons;
                processButtonState(buttonState,isPressed,doRepeat,timestamp);
            }
        } while(++buttonIndex < buttonCount);
        processGamepadAxes(axes,timestamp);
        if(inputGamepad) {
            if(leftAxisState.pressed && leftAxisState.code !== null) {
                const impulse = binds[leftAxisState.inverseCode];
                downKeys[impulse] = getImpulseEvent(impulse,leftAxisState);
            }
            if(rightAxisState.pressed && rightAxisState.code !== null) {
                const impulse = binds[rightAxisState.inverseCode];
                downKeys[impulse] = getImpulseEvent(impulse,rightAxisState);
            }
            inputGamepad(downKeys,time);
        }
    };
    this.poll = poll;
    Object.freeze(this);
};

export default ManagedGamepad;
