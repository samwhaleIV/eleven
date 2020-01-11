import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

async function loadResources() {
    const resourceManager = Eleven.ResourceManager;
    resourceManager.queueImage("test");
    resourceManager.queueAudio("test");
    await resourceManager.loadQueue();
}

const canvasManager = Eleven.CanvasManager;

canvasManager.frame = new (function(){
    this.noContextMenu = true;

    let timedifference = 0;
    let lasttime = 0;

    const pointer = canvasManager.pointerData;

    this.render = (context,timestamp) => {

        const isAlt = pointer.altKey;

        if(!pointer.down || isAlt) {
            timedifference += timestamp - lasttime;
            lasttime = timestamp;
            if(!pointer.down) {
                return;
            }
        }

        const isShift = pointer.shiftKey;

        lasttime = timestamp;
        timestamp = timestamp - timedifference;
        if(isAlt) {
            if(isShift) {
                context.fillStyle = "blue";
            } else {
                context.fillStyle = "red";
            }
        } else {
            context.fillStyle = `rgba(${
                (timestamp/1000)%1*255
            },${
                (timestamp/3000)%1*255
            },${
                (timestamp/10000)%1*255}
            )`;
        }

        context.fillRect(
            pointer.x-25,pointer.y-25,50,50
        );
    }
})();
canvasManager.start();
canvasManager.markLoaded();