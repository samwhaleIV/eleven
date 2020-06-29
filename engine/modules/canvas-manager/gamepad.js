function Gamepad() {
    this.poll = () => {
        const gamepads = navigator.getGamepads();
        let i = 0;
        while(i < gamepads.length) {
            let gamepad = gamepads[i];
            /* This is a hack, starts with S is a proxy for equal to "standard". */
            if(gamepad && gamepad.mapping.startsWith("s",0)) {
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
