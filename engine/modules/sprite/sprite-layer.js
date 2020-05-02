import MultiLayer from "../../internal/multi-layer.js";
import CollisionLayer from "../collision/collision-layer.js";

const HIT_BOX_COLOR = "rgba(180,0,0,0.5)";

function TrackPriority(container,sprite,ID,zIndex) {
    //This is where the third dimension (Z) is added to the 2D space
    const getZIndex = () => zIndex;
    const setZIndex = value => {
        zIndex = value; container.setPriority(ID,zIndex);
    };
    Object.defineProperty(sprite,"zIndex",{
        get: getZIndex, set: setZIndex,
        configurable: true,
        enumerable: true
    });
}

const roundPosition = position => Math.floor(Math.round(position * 2) / 2);

function SpriteLayer(grid) {

    const spriteContainer = new MultiLayer();

    let tileSize = null, context = null, time = null;

    const renderHitBox = sprite => {
        const hitBox = sprite.hitBox; if(!hitBox) return;

        let {x, y, width, height} = hitBox;

        const screenLocation = grid.getLocation(x,y);
        x = screenLocation.x; y = screenLocation.y;

        width = Math.floor(width * tileSize);
        height = Math.floor(height * tileSize);
        
        if(!grid.objectOnScreen(x,y,width,height)) return;

        context.fillStyle = HIT_BOX_COLOR;
        context.fillRect(x,y,width,height);
    };

    const renderHandler = sprite => {
        if(!sprite.render) return;

        let {x, y, width, height, xOffset, yOffset} = sprite;
        if(xOffset) x += xOffset; if(yOffset) y += yOffset;

        const screenLocation = grid.getLocation(x,y);
        x = screenLocation.x, y = screenLocation.y;

        if(sprite.roundRenderPosition) {
            x = roundPosition(x), y = roundPosition(y);
        }

        width = Math.floor(width * tileSize);
        height = Math.floor(height * tileSize);
        
        if(!grid.objectOnScreen(x,y,width,height)) return;
        sprite.render(context,x,y,width,height,time);
        if(sprite.showHitBox) renderHitBox(sprite);
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

    this.add = (sprite,zIndex=0) => {
        if(typeof sprite === "function") {
            sprite = new sprite();
        }
        const ID = spriteContainer.add(sprite,zIndex);
        sprite.ID = ID;
        TrackPriority(spriteContainer,sprite,ID,zIndex);
        return ID;
    };

    this.getCollisionLayer = () => {
        return new CollisionLayer(grid,spriteContainer);
    };

    this.remove = spriteContainer.remove;
    this.clear = spriteContainer.clear;
    Object.freeze(this);
}
export default SpriteLayer;
