import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const canvasManager = engine.CanvasManager;

function ColorPicker(colorChanged) {

    const colors = [
        "yellow","red","blue","green","orange","brown","pink","purple"
    ];

    const picker = document.createElement("div");
    picker.classList.add("picker");

    const left = document.createElement("div");
    const middle = document.createElement("div");
    const right = document.createElement("div");

    let index = 0;

    const safeColor = index => {
        if(index < 0) {
            index = colors.length-1;
        } else if(index > colors.length-1) {
            index = 0;
        }
        return colors[index];
    }

    const setColors = () => {
        let c1 = safeColor(index-1);
        let c2 = safeColor(index);
        let c3 = safeColor(index+1);
        left.style.backgroundColor = c1;
        middle.style.backgroundColor = c2;
        right.style.backgroundColor = c3;
        colorChanged(c2);
    };

    const cycleLeft = () => {
        index -= 1;
        if(index < 0) {
            index = colors.length - 1;
        }
        setColors();
    };
    const cycleRight = () => {
        index += 1;
        if(index > colors.length - 1) {
            index = 0;
        }
        setColors();
    };

    left.onclick = cycleLeft;
    right.onclick = cycleRight;

    picker.appendChild(left);
    picker.appendChild(middle);
    picker.appendChild(right);

    setColors();

    document.body.appendChild(picker);
}

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

    const buffer = new OffscreenCanvas(
        window.innerWidth,window.innerHeight
    );
    const bufferContext = buffer.getContext("2d",{alpha:true});

    let color = "black";
    const colorPicker = new ColorPicker(newColor => {
        color = newColor;
    });

    const circle = (x,y) => {
        bufferContext.beginPath();
        bufferContext.arc(x,y,halfSize,0,Math.PI*2);
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
        canvasManager.bufferResize({
            canvas: buffer,
            context: bufferContext
        },size.width,size.height);
    };

    this.render = (context,_,size) => {

        context.fillStyle = "white";
        context.fillRect(0,0,size.width,size.height);

        if(!movementBuffer.length) {
            context.drawImage(buffer,0,0);
            return;
        };

        bufferContext.fillStyle = color;

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
