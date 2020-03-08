import CollisionBase from "./collision-base.js";

const COLLISION_LAYER = 2;

function TileCollision(grid,tileRenderer,collisionLayer) {
    if(!collisionLayer) collisionLayer = COLLISION_LAYER;

    CollisionBase.call(this,grid,1 / grid.baseTileSize);
    const {width, map, mapSize} = this;

    const getLookupValue = (mapIndex,value) => {return {
        x: mapIndex % width, y: Math.floor(mapIndex / width),
        width: 1, height: 1, value: value
    }};

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
TileCollision.prototype = Object.create(CollisionBase.prototype);

export default TileCollision;
