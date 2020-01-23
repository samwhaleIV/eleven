import GamepadBinds from "./gamepad-binds.js";
const codes = GamepadBinds.Codes;

const threeQuarters = 3 / 4;

function EncodeAxes(xAxis,yAxis) {
    let code = null;
    if(xAxis < 0) {
        if(yAxis < -threeQuarters) {
            code = codes.Up;
        } else if(yAxis > threeQuarters) {
            code = codes.Down;
        } else {
            code = codes.Left;
        }
    } else if(xAxis > 0) {
        if(yAxis < -threeQuarters) {
            code = codes.Up;
        } else if(yAxis > threeQuarters) {
            code = codes.Down;
        } else {
            code = codes.Right;
        }
    } else if(yAxis < 0) {
        code = codes.Up;
    } else if(yAxis > 0) {
        code = codes.Down;
    }
    return code;
};
export default EncodeAxes;
