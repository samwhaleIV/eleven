import CollisionBase from "./collision-base.js";

const RESOLUTION_SCALE = 1; //Greater than 1 is pointless, exactly 1 is deadly.

function CollisionLayer(grid,layer) {
    CollisionBase.call(this,grid,RESOLUTION_SCALE);

    const updateHandler = (sprite,ID) => {
        if(sprite.collides) this.mapSprite(sprite,ID);
    };

    const update = () => {
        this.reset(); layer.forEach(updateHandler);
    };

    const collides = this.getCollisionTest(layer.get);

    this.update = update;
    this.collides = collides;
}
CollisionLayer.prototype = Object.create(CollisionBase.prototype);

export default CollisionLayer;
