const DIRECTIONAL_KEY = "Direction";
const BUMPER_KEY = "Bumper";
const TRIGGER_KEY = "Trigger";
const JOYSTICK_CLICK = "Joystick";

const PROCESS_TOKEN = Symbol("GamepadProcessToken");

const codes = Object.freeze({
    Up: "GamepadUp",
    Right: "GamepadRight",
    Left: "GamepadLeft",
    Down: "GamepadDown",

    ButtonA: "GamepadA",
    ButtonB: "GamepadB",
    ButtonX: "GamepadX",
    ButtonY: "GamepadY",

    BumperLeft: "GamepadBumperLeft",
    BumperRight: "GamepadBumperRight",

    TriggerLeft: "GamepadTriggerLeft",
    TriggerRight: "GamepadTriggerRight",

    Select: "GamepadSelect",
    Start: "GamepadStart",

    JoystickLeft: "GamepadJoystickLeft",
    JoystickRight: "GamepadJoystickRight"
});

const codesInverse = Object.freeze(Object.entries(codes).reduce((set,[value,key])=>{
    set[key] = value; return set;
},new Object()));

const codeOrder = Object.freeze([
    codes.ButtonA,
    codes.ButtonB,
    codes.ButtonX,
    codes.ButtonY,
    codes.BumperLeft,
    codes.BumperRight,
    codes.TriggerLeft,
    codes.TriggerRight,
    codes.Select,
    codes.Start,
    codes.JoystickLeft,
    codes.JoystickRight,
    codes.Up,
    codes.Down,
    codes.Left,
    codes.Right
]);

const keys = Object.freeze({
    GamepadA: "a",
    GamepadB: "b",
    GamepadX: "x",
    GamepadY: "y",
    
    GamepadSelect: "Select",
    GamepadStart: "Start",

    GamepadUp: DIRECTIONAL_KEY,
    GamepadRight: DIRECTIONAL_KEY,
    GamepadLeft: DIRECTIONAL_KEY,
    GamepadDown: DIRECTIONAL_KEY,

    GamepadBumperLeft: BUMPER_KEY,
    GamepadBumperRight: BUMPER_KEY,

    GamepadTriggerLeft: TRIGGER_KEY,
    GamepadTriggerRight: TRIGGER_KEY,

    GamepadJoystickLeft: JOYSTICK_CLICK,
    GamepadJoystickRight: JOYSTICK_CLICK
});

export default Object.freeze({
    ProcessToken: PROCESS_TOKEN,
    Codes: codes,
    CodesInverse: codesInverse,
    CodeOrder: codeOrder,
    Keys: keys,
    TriggerKey: TRIGGER_KEY,
    DirectionalKey: DIRECTIONAL_KEY
});
