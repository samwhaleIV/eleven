function DeadzoneScale(deadzone,value) {
    if(value < 0) {
        value += deadzone;
        if(value > 0) {
            value = 0;
        } else {
            value /= 1 - deadzone;
        }
    } else {
        value -= deadzone;
        if(value < 0) {
            value = 0;
        } else {
            value /= 1 - deadzone;
        }
    }
    return value;
}
export default DeadzoneScale;
