import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

async function loadResources() {
    const resourceManager = Eleven.ResourceManager;
    resourceManager.queueImage("test");
    resourceManager.queueAudio("test");
    await resourceManager.loadQueue();
}

const canvasManager = Eleven.CanvasManager;

let lastX = -Infinity;
let lastY = -Infinity;
let pointerDown = false;
let timedifference = 0;
let lasttime = 0;
canvasManager.frame = {
    pointerMove: (x,y) => {
        lastX = x;
        lastY = y;
    },
    clickDown: function(x,y) {
        pointerDown = true;
        lastX = x;
        lastY = y;
    },
    clickUp: function(x,y) {
        pointerDown = false
        lastX = x;
        lastY = y;
    },
    render: function(context,size,timestamp) {
        if(canvasManager.paused) {
            //Purple is bad
            context.fillStyle = "purple";
            context.fillRect(10,10,size.width-20,size.height-20);
            return;
        }
        if(!pointerDown) {
            timedifference += timestamp - lasttime;
            lasttime = timestamp;
            return;
        }
        lasttime = timestamp;
        timestamp = timestamp - timedifference;
        context.fillStyle = `rgba(${(timestamp/1000)%1*255},${(timestamp/3000)%1*255},${(timestamp/10000)%1*255})`;
        context.fillRect(lastX-25,lastY-25,50,50);
    }
}
canvasManager.start();
canvasManager.markLoaded();