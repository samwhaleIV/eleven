function Gamepad() {
    const isValidGamepad = gamepad => {
        return gamepad && gamepad.mapping === "standard";
    };
    const getGamepadData = gamepad => {
        return {
            axes: gamepad.axes,
            buttons: gamepad.buttons
        };
    };
    this.poll = () => {
        let gamepad = null;
        const gamepads = navigator.getGamepads();
        let i = 0;
        while(i < gamepads.length) {
            gamepad = gamepads[i];
            if(isValidGamepad(gamepad)) {
                return getGamepadData(gamepad);
            }
            i++;
        }
        return null;
    };
    Object.freeze(this);
}
export default Gamepad;
