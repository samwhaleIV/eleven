import Eleven from "../engine/eleven.js";
const {CanvasManager, Frame} = Eleven;
import Board from "./board.js";

(async function() {
    await CanvasManager.start({
        frame: Frame.create({
            base: Board,
            gamepad: {
                binds: {
                    Up: "KeyW",
                    Down: "KeyS",
                    Left: "KeyA",
                    Right: "KeyD",
                    ButtonA: "Enter",
                    ButtonB: "Escape"
                },
                whitelist: true,
                triggerThreshold: 0.1,
                repeatButtons: true,
                repeatAxes: true,
                repeatTriggers: false,
                repeatDelay: 200,
                repeatRate: 150,
                axisDeadzone: 0.7,
                manageLeftAxis: true,
                manageRightAxis: false,
                compositeLeftAxis: true,
                compositeRightAxis: false
            },
            keyBinds: {
                KeyW: "KeyW",
                KeyS: "KeyS",
                KeyA: "KeyA",
                KeyD: "KeyD",
                ArrowUp: "KeyW",
                ArrowDown: "KeyS",
                ArrowLeft: "KeyA",
                ArrowRight: "KeyD",
                Enter: "Enter",
                Escape: "Escape"
            }
        }),
        target: document.getElementById("board-container")
    });
})();
