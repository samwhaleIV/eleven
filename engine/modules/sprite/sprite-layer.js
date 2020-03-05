import MultiLayer from "../../internal/multi-layer.js";

function SpriteLayer(grid) {

    const spriteContainer = new MultiLayer();

    let tileSize = null, context = null, time = null;
    const renderHandler = sprite => {
        if(!sprite.render) return;
        let {x, y, width, height, xOffset, yOffset} = sprite;
        if(xOffset) x += xOffset;
        if(yOffset) y += yOffset;
        if(grid.objectOnScreen(x,y,width,height)) {
            const renderPosition = grid.getLocation(x,y);
            x = renderPosition.x;
            y = renderPosition.y;
            width *= tileSize;
            height *= tileSize;
            sprite.render(context,x,y,width,height,time);
        }
    };
    const updateHandler = sprite => {
        if(!sprite.update) return;
        sprite.update(time);
    };

    const update = (context,size,newTime) => {
        time = newTime;
        spriteContainer.forEach(updateHandler);
    };
    const render = (newContext,size,newTime) => {
        context = newContext;
        time = newTime;
        tileSize = grid.tileSize;
        spriteContainer.forEach(renderHandler);
    };

    this.update = update;
    this.render = render;

    this.bindToRenderer = renderer => {
        renderer.update = update;
        renderer.render = render;
    };

    this.add = spriteContainer.add;
    this.remove = spriteContainer.remove;
    this.clear = spriteContainer.clear;

    Object.freeze(this);
}
export default SpriteLayer;
