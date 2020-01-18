import engine from "../engine/eleven.js";
import DrawApp from "./draw-app.js";

Namespace.makeGlobal(engine);
const canvasManager = engine.CanvasManager;

canvasManager.start({
    target: document.body,
    frame: new DrawApp(canvasManager),
    markLoaded: true
});
