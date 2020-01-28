import Eleven from "../engine/eleven.js";
const {CanvasManager, Frame} = Eleven;
import ImageTest from "./image-test.js";
import Board from "./board.js";

Namespace.makeGlobal(Eleven);

(async function() {
    await CanvasManager.start({
        frame: Board,
        target: document.getElementById("board-container")
    });
})();
