function DebugRenderer(world) {
    world.setSize(100,40);

    this.renderStart = (context,{width,height}) => {
        context.fillStyle = "purple";
        context.fillRect(0,0,width,height);
    };

    let endX, endY, startX, startY, tileSize, context;

    this.configTileRender = data => {
        context = data.context;
        endX = data.endX;
        endY = data.endY;
        startX = data.startX;
        startY = data.startY;
        tileSize = data.tileSize;
    };
    this.renderTile = (x,y,renderX,renderY) => {

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

}
export default DebugRenderer;
