import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

async function loadResources() {
    const resourceManager = Eleven.ResourceManager;
    resourceManager.queueImage("test");
    resourceManager.queueAudio("test");
    await resourceManager.loadQueue();
}

const canvasManager = Eleven.CanvasManager;

canvasManager.frame = {
    render: function(context,size) {
        context.fillStyle = "green";
        context.fillRect(0,0,size.width,size.height);
    }
};
canvasManager.frame.child = {
    render: function(context,size,timestamp) {
        context.fillStyle = "red";
        context.fillRect(10,10,size.width-20,size.height-20);
        context.fillStyle = "white";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = "22px sans-serif";
        context.fillText(timestamp.toFixed(4),size.halfWidth,size.halfHeight);
    }
}
canvasManager.start();
canvasManager.markLoaded();