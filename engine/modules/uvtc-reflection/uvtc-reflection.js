import CompositeProcessor from "./composite-processor.js";

const DEFAULT_WATER_COLOR = "#0E110E";
const DEFAULT_REFLECTION_ALPHA = 0.15;

function GetBaseReflector(waterColor,reflectionAlpha,tileOffsetDistance,composite) {
    if(!waterColor) {
        waterColor = DEFAULT_WATER_COLOR;
    }
    if(!reflectionAlpha) {
        reflectionAlpha = DEFAULT_REFLECTION_ALPHA;
    }
    if(!tileOffsetDistance) {
        tileOffsetDistance = 0;
    }
    const compositor = new CompositeProcessor(true);
    compositor.waterColor = waterColor;
    compositor.tileOffsetDistance = tileOffsetDistance;
    compositor.reflectionAlpha = reflectionAlpha;
    compositor.clear = (context,{width,height}) => {
        context.clearRect(0,0,width,height);
    };
    compositor.enable();

    if(typeof composite === "function") {
        compositor.composite = composite.bind(compositor)
    }
    return compositor;
}
function GetStaticReflector(grid,waterColor,reflectionAlpha,tileOffsetDistance) {
    return GetBaseReflector(waterColor,reflectionAlpha,tileOffsetDistance,function(context,buffer,xOffset,yOffset) {
        context.fillStyle = this.waterColor;
        const fullWidth = this.width;
        const fullHeight = this.height;
        context.fillRect(0,0,fullWidth,fullHeight);
        context.save();
        context.globalAlpha = this.reflectionAlpha;
        context.scale(1,-1);
        const reflectionDistance = grid.tileSize * this.tileOffsetDistance;
        context.drawImage(
            buffer,0,0,fullWidth,fullHeight,
            xOffset,yOffset+reflectionDistance,
            fullWidth,-fullHeight
        );
        context.restore();
        context.drawImage(
            buffer,0,0,fullWidth,fullHeight,
            xOffset,yOffset,fullWidth,fullHeight
        );
    });
}
function GetScrollableReflector(grid,waterColor,reflectionAlpha,tileOffsetDistance) {
    return GetBaseReflector(waterColor,reflectionAlpha,tileOffsetDistance,function(context,buffer,xOffset,yOffset) {
        context.fillStyle = this.waterColor;
        const fullWidth = this.width;
        const fullHeight = this.height;
        context.fillRect(0,0,fullWidth,fullHeight);
        context.save();
        context.globalAlpha = this.reflectionAlpha;
        const tileSize = grid.tileSize;
        const reflectionDistance = tileSize * this.tileOffsetDistance;
        context.drawImage(
            buffer,0,0,fullWidth,fullHeight,
            xOffset+reflectionDistance,yOffset+reflectionDistance,
            fullWidth,fullHeight
        );
        context.restore();
        context.drawImage(
            buffer,0,0,fullWidth,fullHeight,
            xOffset,yOffset,fullWidth,fullHeight
        );
    });
}

export default GetScrollableReflector;
export { GetScrollableReflector, GetStaticReflector }
