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

    const lastLocation = canvasManager.pointerPosition;

    const pointerDown = () => {
        return canvasManager.pointerDown;
    };

    let isAlt = false;
    let isShift = false;

    this.keyDown = console.log;

    this.clickDown = ({
        altKey,shiftKey
    }) => {
        if(altKey) {
            isAlt = true;
        }
        if(shiftKey) {
            isShift = true;
        }
    };
    this.clickUp = () => {
        isAlt = false;
        isShift = false;
    };

    this.render = (context,timestamp) => {
        if(!pointerDown() || isAlt) {
            timedifference += timestamp - lasttime;
            lasttime = timestamp;
            if(!isAlt) {
                return;
            }
        }
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
            lastLocation.x-25,lastLocation.y-25,50,50
        );
    }
})();
canvasManager.start();
canvasManager.markLoaded();