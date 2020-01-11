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
let lastX = -Infinity;
let lastY = -Infinity;
canvasManager.frame.child = {
    pointerMove: (x,y) => {
        lastX = x;
        lastY = y;
    },
    clickDown: function(x,y) {
        console.log("Click down:",{x,y});
    },
    clickUp: function(x,y) {
        console.log("Click up:",{x,y});
    },
    altClickDown: function(x,y) {
        console.log("Alt click down:",{x,y});
    },
    altClickUp: function(x,y) {
        console.log("Alt click up:",{x,y});
    },
    render: function(context,size,timestamp) {
        if(canvasManager.paused) {
            context.fillStyle = "purple";
            context.fillRect(10,10,size.width-20,size.height-20);
            return;
        }
        context.fillStyle = "red";
        context.fillRect(10,10,size.width-20,size.height-20);
        context.fillStyle = "white";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = "22px sans-serif";
        context.fillText(timestamp.toFixed(4),size.halfWidth,size.halfHeight);
        context.fillStyle = "blue";
        context.fillRect(lastX-25,lastY-25,50,50);
    },
    keyDown: function(key) {
        if(key.code === "KeyA") console.log("Key a down MANAGED");
    },
    input: keys => {
        if(keys["KeyA"]) {
            console.log("Key a down UNMANAGED");
            return;canvasManager.pause();
        }
    },
    resize: () => {
        console.log("Resized")
    }
}
canvasManager.start();
canvasManager.markLoaded();