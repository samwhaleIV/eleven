import engine from "../engine/eleven.js";
import DrawApp from "./draw-app.js";

engine.CanvasManager.start({
    frame: DrawApp,
    markLoaded: true
});
