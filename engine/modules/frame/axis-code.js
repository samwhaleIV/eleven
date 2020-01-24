const threeQuarters = 3 / 4;
function EncodeAxes(xAxis,yAxis,codes) {
    let code = null;
    if(xAxis < 0) {
        if(yAxis < -threeQuarters) {
            code = codes.up;
        } else if(yAxis > threeQuarters) {
            code = codes.down;
        } else {
            code = codes.left;
        }
    } else if(xAxis > 0) {
        if(yAxis < -threeQuarters) {
            code = codes.up;
        } else if(yAxis > threeQuarters) {
            code = codes.down;
        } else {
            code = codes.right;
        }
    } else if(yAxis < 0) {
        code = codes.up;
    } else if(yAxis > 0) {
        code = codes.down;
    }
    return code;
};
export default EncodeAxes;
