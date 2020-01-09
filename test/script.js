import "../namespace-test/shapes.js";

const canvasManager = Eleven.CanvasManager;
const resourceManager = Eleven.ResourceManager;
const context = canvasManager.context;
const size = context.size;

document.body.classList.add("loaded");

context.fillStyle = "red";
context.fillRect(
    0,0,size.width,size.height
);

resourceManager.queueImage("test");
resourceManager.queueAudio("test");
resourceManager.loadQueue();
