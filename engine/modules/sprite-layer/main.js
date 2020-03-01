import MultiLayer from "../../internal/multi-layer.js";

function SpriteLayer(grid) {

    const spriteContainer = new MultiLayer();

    let tileSize = null;
    const renderHandler = (sprite,context,time) => {
        let {x, y, width, height} = sprite;
        if(grid.objectOnScreen(x,y,width,height)) {
            const renderPosition = grid.getLocation(x,y);
            x = renderPosition.x; y = renderPosition.y;
            width *= tileSize; height *= tileSize;
            sprite.render(context,x,y,width,height,time);
        }
    };

    const update = (context,size,time) => {
        spriteContainer.forEach(sprite => {
            if(sprite.update) sprite.update(time);
        });
    };
    const render = (context,size,time) => {
        tileSize = grid.tileSize;
        spriteContainer.forEach(sprite => {
            if(!sprite.render) return;
            renderHandler(sprite,context,time);
        });
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
