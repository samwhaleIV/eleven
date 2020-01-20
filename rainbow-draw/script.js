import engine from "../engine/eleven.js";
import DrawApp from "./draw-app.js";

Namespace.makeGlobal(engine);
const canvasManager = engine.CanvasManager;

canvasManager.start({
    frame: new DrawApp(canvasManager),
    markLoaded: true
});
