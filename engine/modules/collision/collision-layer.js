import CollisionBase from "./collision-base.js";

const RESOLUTION_SCALE = 2;

function CollisionLayer(grid,layer) {
    CollisionBase.call(this,grid,RESOLUTION_SCALE);

    const dropWatcher = ID => this.dropSpriteCache(ID);
    layer.addDropWatcher(dropWatcher);

    const updateHandler = (sprite,ID) => {
        if(sprite.collides) {
            this.mapSpriteCached(sprite,ID);
        } else {
            this.dropSpriteCache(ID);
        }
    };

    const update = () => layer.forEach(updateHandler);

    const collides = this.getCollisionTest(layer.get);

    this.update = update;
    this.collides = collides;
}
CollisionLayer.prototype = CollisionBase.prototype;

export default CollisionLayer;
