import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const canvasManager = engine.CanvasManager;

function DrawApp(canvasManager) {
    this.noContextMenu = false;
    this.doubleResizeBuffer = true;

    const pointer = canvasManager.pointer;

    const size = 10;
    const halfSize = size / 2;

    const precision = halfSize / 2;

    function lerp(v0,v1,t) {
        return (1 - t) * v0 + t * v1;
    }

    const buffer = new OffscreenCanvas(1,1);
    const bufferContext = buffer.getContext("2d",{alpha:true});
    
    const circle = (x,y) => {
        bufferContext.beginPath();
        bufferContext.arc(x,y,halfSize,0,Math.PI*2);
        bufferContext.fill();
    };
    
    const getColor = (isAlt,isShift,timestamp) => {
        if(isAlt) {
            if(isShift) {
                return "blue";
            } else {
                return "red";
            }
        } else {
            return `rgba(${
                (timestamp/1000)%1*255
            },${
                (timestamp/3000)%1*255
            },${
                (timestamp/10000)%1*255}
            )`;
        }
    };

    const movementBuffer = [];

    this.pointerMove = ({x,y,isDown}) => {
        if(!isDown) return;
        movementBuffer.push({x,y});
    };
    this.clickUp = () => {
        movementBuffer.splice(0);
    };

    this.resize = (size,context,canvasBuffer) => {
        context.fillStyle = "white";
        context.fillRect(0,0,size.width,size.height);
        context.drawImage(canvasBuffer,0,0);

        buffer.width = size.width;
        buffer.height = size.height;
    };

    let timeDifference = 0;

    this.render = (context,{now,delta}) => {

        if(!movementBuffer.length) {
            timeDifference += delta;
            context.drawImage(buffer,0,0);
            return;
        };
        now -= timeDifference;

        const isAlt = pointer.altKey;
        const isShift = pointer.shiftKey;

        bufferContext.fillStyle = getColor(isAlt,isShift,now);

        let lastPos = movementBuffer[0];
        circle(lastPos.x,lastPos.y);

        for(let i = 1;i<movementBuffer.length;i++) {
            const pos = movementBuffer[i];

            const xDistance = Math.abs(lastPos.x-pos.x);
            const yDistance = Math.abs(lastPos.y-pos.y);
            const totalDistance = xDistance + yDistance;
            let distance = totalDistance;
            while(distance > 0) {
                const t = (totalDistance - distance) / totalDistance;
                const x = lerp(lastPos.x,pos.x,t);
                const y = lerp(lastPos.y,pos.y,t);
                circle(x,y);
                distance -= precision;
            }

            circle(pos.x,pos.y);
            lastPos = pos;
        }

        movementBuffer.splice(0,movementBuffer.length-1);

        context.drawImage(buffer,0,0);
    };
}

canvasManager.frame = new DrawApp(canvasManager);
canvasManager.start();
canvasManager.markLoaded();
