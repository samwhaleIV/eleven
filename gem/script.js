import Eleven from "../engine/eleven.js";
const {CanvasManager, Frame} = Eleven;
import ImageTest from "./image-test.js";

Namespace.makeGlobal(Eleven);

(async function() {
    await CanvasManager.start({
        frame: ImageTest,
        target: document.body
    });
})();
