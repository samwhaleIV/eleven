import CollisionBase from "./collision-base.js";

const RESOLUTION_SCALE = 2;

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
CollisionLayer.prototype = CollisionBase.prototype;

export default CollisionLayer;
