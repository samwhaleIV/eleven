function DebugRenderer() {

    this.background = (context,{width,height}) => {
        context.fillStyle = "purple";
        context.fillRect(0,0,width,height);
    };

    let tileSize, context;

    this.configTileRender = data => {
        context = data.context;
        tileSize = data.tileSize;
    };

    this.renderTile = (x,y,renderX,renderY) => {
        if((x + y) % 2 === 0) {
            context.fillStyle = "black";
        } else {
            context.fillStyle = "white";
        }
        context.fillRect(renderX,renderY,tileSize,tileSize);
    };


}
export default DebugRenderer;
