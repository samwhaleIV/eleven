import Constants from "../../internal/constants.js";
import GamepadBinds from "./gamepad-binds.js";
import DeadzoneScale from "./deadzone-scale.js";
import EncodeAxes from "./axis-code.js";

const inputRoutes = Constants.InputRoutes;
const KEY_DOWN = inputRoutes.keyDown;
const KEY_UP = inputRoutes.keyUp;

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

const GAMEPAD_INPUT_TARGET = GamepadBinds.GamepadInputTarget;

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

function GamepadProcessor(settings) {

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

    const getFrameTarget = (frame,target) => {
        return frame[GAMEPAD_INPUT_TARGET][target];
    };

    const sendKey = (frame,down,buttonState) => {
        const target = down ? KEY_DOWN : KEY_UP;
        const code = buttonState.inverseCode;
        let impulse;
        if(code in binds) {
            impulse = binds[code];
        } else return;
        const frameTarget = getFrameTarget(frame,target);
        if(frameTarget) {
            frameTarget(getImpulseEvent(
                impulse,buttonState
            ));
        }
    };
    
    const processKeyRepeat = (buttonState,frame,timestamp) => {
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
            sendKey(frame,true,buttonState);
        }
    };

    const processButtonState = (buttonState,isPressed,doRepeat,frame,timestamp) => {
        if(isPressed !== buttonState.pressed) {
            const sendMode = isPressed;
            buttonState.pressed = sendMode;

            const pressedTime = sendMode ? timestamp : null;
            buttonState.pressedTime = pressedTime;

            if(!sendMode) {
                buttonState.repeatTime = null;
            }
            sendKey(frame,sendMode,buttonState);
        } else if(isPressed && doRepeat) {
            processKeyRepeat(buttonState,frame,timestamp);
        }
    };

    const nonZeroAxes = (xAxis,yAxis) => {
        return xAxis !== 0 || yAxis !== 0;
    };

    const processAxis = (axisState,xAxis,yAxis,frame,timestamp) => {
        xAxis = DeadzoneScale(axisDeadzone,xAxis);
        yAxis = DeadzoneScale(axisDeadzone,yAxis);
        let isPressed = nonZeroAxes(xAxis,yAxis);
        const newCode = EncodeAxes(xAxis,yAxis,axisState.codes);
        if(newCode !== null) {
            if(axisState.code !== newCode) {
                if(axisState.pressed) {
                    sendKey(frame,false,axisState);
                }
                axisState.pressed = false;
            }
            axisState.code = newCode;
        }
        processButtonState(axisState,isPressed,repeatAxes,frame,timestamp);
    };

    const processGamepadAxes = (axes,frame,timestamp) => {
        if(manageLeftAxis) {
            const x = axes[LEFT_X_AXIS];
            const y = axes[LEFT_Y_AXIS];
            processAxis(leftAxisState,x,y,frame,timestamp);
        }
        if(manageRightAxis) {
            const x = axes[RIGHT_X_AXIS];
            const y = axes[RIGHT_Y_AXIS];
            processAxis(rightAxisState,x,y,frame,timestamp);
        }
    };

    const buttonIsPressed = (button,isTrigger) => {
       return isTrigger ? button.value > triggerThreshold : button.pressed;
    };
    const process = (frame,{buttons,axes},time) => {
        const timestamp = time.now;
        let buttonIndex = 0;
        do {
            const button = buttons[buttonIndex];
            const buttonState = buttonStates[buttonIndex];

            const isTrigger = buttonState.key === TRIGGER_KEY;
            const isPressed = buttonIsPressed(button,isTrigger);

            const doRepeat = isTrigger ? repeatTriggers : repeatButtons;

            processButtonState(buttonState,isPressed,doRepeat,frame,timestamp);

        } while(++buttonIndex < buttonCount);
        processGamepadAxes(axes,frame,timestamp);
    };
    this.process = process;
    Object.freeze(this);
};

export default GamepadProcessor;
