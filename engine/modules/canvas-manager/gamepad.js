function Gamepad() {
    this.poll = () => {
        const gamepads = navigator.getGamepads();
        let i = 0;
        while(i < gamepads.length) {
            let gamepad = gamepads[i];
            if(gamepad && gamepad.mapping === "standard") {
                return {
                    axes: gamepad.axes,
                    buttons: gamepad.buttons
                }
            }
            i++;
        }
        return null;
    };
    Object.freeze(this);
}
export default Gamepad;
