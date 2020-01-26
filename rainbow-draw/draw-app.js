import ColorPicker from "./color-picker.js";
import engine from "../engine/eleven.js";
const CanvasManager = engine.CanvasManager;

function DrawApp() {
    const pointer = CanvasManager.pointer;

    const size = 10;
    const halfSize = size / 2;
    const precision = halfSize / 2;

    function lerp(v0,v1,t) {
        return (1 - t) * v0 + t * v1;
    }

    const buffer = new OffscreenCanvas(
        window.screen.width,window.screen.height
    );
    const bufferContext = buffer.getContext("2d",{alpha:true});

    const colorPicker = new ColorPicker();

    const circle = (x,y,size) => {
        bufferContext.beginPath();
        bufferContext.arc(x,y,size,0,Math.PI*2);
        bufferContext.fill();
    };

    const movementBuffer = [];

    this.pointerMove = ({x,y,isDown}) => {
        if(!isDown) return;
        movementBuffer.push({x,y});
    };
    this.clickUp = () => {
        movementBuffer.splice(0);
    };

    this.resize = size => {
        CanvasManager.bufferResize({
            canvas: buffer,
            context: bufferContext
        },size.width,size.height);
    };

    this.render = (context,size) => {

        context.fillStyle = "white";
        context.fillRect(0,0,size.width,size.height);

        if(!movementBuffer.length) {
            context.drawImage(buffer,0,0);
            return;
        };

        const erasing = pointer.altKey;
        bufferContext.fillStyle = erasing ? "white" : colorPicker.color;
        const circleSize = erasing ? halfSize * 4: halfSize;

        let lastPos = movementBuffer[0];
        circle(lastPos.x,lastPos.y,circleSize);

        for(let i = 1;i<movementBuffer.length;i++) {
            const pos = movementBuffer[i];
            const totalDistance = Math.sqrt(
                Math.pow(lastPos.x-pos.x,2) + Math.pow(lastPos.y-pos.y,2)
            );
            let distance = totalDistance;

            while(distance > 0) {
                const t = (totalDistance - distance) / totalDistance;
                const x = lerp(lastPos.x,pos.x,t);
                const y = lerp(lastPos.y,pos.y,t);
                circle(x,y,circleSize);
                distance -= precision;
            }

            circle(pos.x,pos.y,circleSize);
            lastPos = pos;
        }
        movementBuffer.splice(0,movementBuffer.length-1);
    
        context.drawImage(buffer,0,0);
    };
}
export default DrawApp;
