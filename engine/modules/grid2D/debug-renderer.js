function DebugRenderer(world) {
    world.setSize(100,40);

    this.renderStart = (context,{width,height}) => {
        context.fillStyle = "purple";
        context.fillRect(0,0,width,height);
    };

    let endX, endY, startX, startY, tileSize, context, rangeX, rangeY;

    this.configTileRender = data => {
        context = data.context;
        endX = data.endX;
        endY = data.endY;
        startX = data.startX;
        startY = data.startY;
        tileSize = data.tileSize;
        rangeX = data.rangeX;
        rangeY = data.rangeY;
    };

    let renderCounter = 0;
    this.renderTile = (x,y,renderX,renderY) => {
        renderCounter++;
        if((x + y) % 2 === 0) {
            context.fillStyle = "black";
        } else {
            context.fillStyle = "white";
        }
        if(x - startX === 0) {
            context.fillStyle = "blue";
        } else if(x === endX) {
            context.fillStyle = "green";
        }
        if(y - startY === 0) {
            context.fillStyle = "red";
        } else if(y === endY) {
            context.fillStyle = "yellow";
        }
        context.fillRect(renderX,renderY,tileSize,tileSize);
    };

    this.renderEnd = () => {
        const expected = rangeX * rangeY;
        if(renderCounter !== expected) {
            console.error(`Unchecked overdraw. Expected ${expected} renders, got ${renderCounter}`);
        }
        renderCounter = 0;
    }

}
export default DebugRenderer;
