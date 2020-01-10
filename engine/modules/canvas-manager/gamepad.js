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
        for(let i = 0;i < gamepads.length;i++) {
            gamepad = gamepads[i];
            if(isValidGamepad(gamepad)) {
                return getGamepadData(gamepad);
            }
        }
        return null;
    };
}
export default Gamepad;
