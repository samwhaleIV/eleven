import GamepadProcessor from "./gamepad-processor.js";
import GamepadBinds from "./gamepad-binds.js";
import Constants from "../../internal/constants.js";

const GAMEPAD_CODES = GamepadBinds.Codes;
const DEFAULT_SETTINGS = Constants.ManagedGamepadSettings;
const PROCESS_TOKEN = GamepadBinds.ProcessToken;

const validateBinds = binds => {
    Object.keys(binds).forEach(key => {
        if(!(key in GAMEPAD_CODES)) delete binds[key];
    });
    return binds;
};

const coldAssign = (target,values) => Object.freeze(
    Object.assign(target,values)
);
const lockAssign = (target,values) => Object.seal(
    Object.assign(target,values)
);
const bufferAssign = (target,schema,values) => coldAssign(
    lockAssign(target,schema),values
);

function ManagedGamepad(settings) {
    const binds = new Object();
    const settingBinds = settings.binds;
    if(settingBinds) {
        delete settings.binds;
    }
    const safeSettings = bufferAssign(
        {binds},DEFAULT_SETTINGS,settings
    );

    if(!settings.whitelist) {
        Object.assign(binds,GAMEPAD_CODES);
    }
    if(settingBinds) {
        Object.assign(binds,settingBinds);
    }
    Object.freeze(validateBinds(binds));

    const gamepadProcessor = new GamepadProcessor(safeSettings);
    const process = gamepadProcessor[PROCESS_TOKEN];
    this.getPollingFilter = frame => {
        return process.bind(gamepadProcessor,frame);
    };
    Object.freeze(this);
}
export default ManagedGamepad;
