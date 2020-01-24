const DIRECTION_KEY = "Direction";
const BUMPER_KEY = "Bumper";
const TRIGGER_KEY = "Trigger";
const JOYSTICK_CLICK = "Joystick";
const JOYSTICK_KEY = "JoystickDirection";

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

    LeftJoystick: "GamepadLeftJoystick",
    RightJoystick: "GamepadRightJoystick",

    LeftJoystickUp: "LeftJoystickUp",
    LeftJoystickDown: "LeftJoystickDown",
    LeftJoystickLeft: "LeftJoystickLeft",
    LeftJoystickRight: "LeftJoystickRight",

    RightJoystickUp: "RightJoystickUp",
    RightJoystickDown: "RightJoystickDown",
    RightJoystickLeft: "RightJoystickLeft",
    RightJoystickRight: "RightJoystickRight",
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
    codes.LeftJoystick,
    codes.RightJoystick,
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

    GamepadUp: DIRECTION_KEY,
    GamepadRight: DIRECTION_KEY,
    GamepadLeft: DIRECTION_KEY,
    GamepadDown: DIRECTION_KEY,

    GamepadBumperLeft: BUMPER_KEY,
    GamepadBumperRight: BUMPER_KEY,

    GamepadTriggerLeft: TRIGGER_KEY,
    GamepadTriggerRight: TRIGGER_KEY,

    GamepadLeftJoystick: JOYSTICK_CLICK,
    GamepadRightJoystick: JOYSTICK_CLICK,

    LeftJoystickUp: JOYSTICK_KEY,
    LeftJoystickDown: JOYSTICK_KEY,
    LeftJoystickLeft: JOYSTICK_KEY,
    LeftJoystickRight: JOYSTICK_KEY,

    RightJoystickUp: JOYSTICK_KEY,
    RightJoystickDown: JOYSTICK_KEY,
    RightJoystickLeft: JOYSTICK_KEY,
    RightJoystickRight: JOYSTICK_KEY,
});

export default Object.freeze({
    Codes: codes,
    CodesInverse: codesInverse,
    CodeOrder: codeOrder,
    Keys: keys,
    TriggerKey: TRIGGER_KEY,
    DirectionKey: DIRECTION_KEY,
    JOYSTICK_KEY: JOYSTICK_KEY
});
