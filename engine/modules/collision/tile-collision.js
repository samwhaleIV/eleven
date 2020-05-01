import CollisionBase from "./collision-base.js";

const COLLISION_LAYER = 2;

const fullSquareCollision = (x,y,value) => {
    return {x,y,width:1,height:1,value};
};

function TileCollision(grid,tileRenderer,collisionLayer,collisionMaker) {

    if(!collisionMaker) collisionMaker = fullSquareCollision;

    if(!collisionLayer) collisionLayer = COLLISION_LAYER;

    CollisionBase.call(this,grid,1 / grid.baseTileSize);
    const {width, map, mapSize} = this;

    const getLookupValue = (mapIndex,value) => {
        const x = mapIndex % width;
        const y = Math.floor(mapIndex / width);
        return collisionMaker(x,y,value);
    };

    let lookupCounter = 1;
    const lookup = new Array();

    const resetCollisionLookup = () => {
        lookupCounter = 1; lookup.splice(0);
    };

    const writeCollisionLayer = () => {
        const layer = tileRenderer.readLayer(collisionLayer);
        for(let i = 0;i<mapSize;i++) {
            const value = layer[i];
            if(!value) {
                map[i] = 0; continue;
            }

            map[i] = lookupCounter;
            const lookupValue = getLookupValue(i,value);
            lookup[lookupCounter] = lookupValue;
            lookupCounter++;
        }
    };
    const reset = () => {
        resetCollisionLookup();
        writeCollisionLayer();
    };
    writeCollisionLayer();

    const collides = this.getCollisionTest(value => {
        return lookup[value];
    });

    this.reset = reset;
    this.collides = collides;
}
TileCollision.prototype = CollisionBase.prototype;

export default TileCollision;
