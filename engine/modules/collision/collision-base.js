const WARN_FLOATING_TILE_SIZE = baseTileSize => {
    console.warn(`Tile size ${baseTileSize} cannot be even multiple of resolution scale ${RESOLUTION_SCALE}`);
};

const narrowBand = (a,b) => {
 return !(a.x + a.width <= b.x  ||
          a.y + a.height <= b.y ||
          a.x >= b.x + b.width  ||
          a.y >= b.y + b.height
)};

const spriteHitBoxFilter = sprite => {
    let hitBox = sprite.hitBox;
    if(!hitBox) hitBox = sprite;
    return hitBox;
};

const spriteReturnFilter = sprite => {
    let hitBox = spriteHitBoxFilter(sprite);
    if(sprite !== hitBox) {
        hitBox.target = sprite;
        hitBox.isHitBox = true;
    }
    return hitBox;
};

function CollisionBase(grid,resolutionScale) {
    const baseTileSize = grid.baseTileSize;

    const tileSize = baseTileSize * resolutionScale;
    if(tileSize % 1 !== 0) WARN_FLOATING_TILE_SIZE(baseTileSize);

    const width = Math.floor(grid.width * tileSize);
    const height = Math.floor(grid.height * tileSize);

    const mapSize = width * height;
    const map = new Array(mapSize);
    
    this.tileSize = tileSize;
    this.width = width; this.height = height;
    this.mapSize = mapSize;
    this.map = map;

    this.reset();
}
CollisionBase.prototype.getCollisionTest = function(valueProcessor) {
    return sprite => {
        const hitList = this.checkSprite(sprite);
        if(!hitList.length) return null;

        sprite = spriteHitBoxFilter(sprite);
        
        let hitListIndex = 0;

        do {
            const hitValue = valueProcessor(hitList[hitListIndex]);
            const target = spriteReturnFilter(hitValue);

            if(narrowBand(sprite,target)) return target;

        } while(++hitListIndex < hitList.length);

        return null;
    };
}

CollisionBase.prototype.reset = function() {
    const {map, mapSize} = this;
    for(let i = 0;i<mapSize;i++) map[i] = 0;
}
CollisionBase.prototype.write = function(startX,y,endX,endY,value) {
    const {map, mapSize, width} = this;
    while(y<endY) {
        let x = startX;
        while(x<endX) {
            const index = x + y * width;
            if(index >= 0 && index < mapSize) {
                map[index] = value;
            }
            x++;
        }
        y++;
    }
}
CollisionBase.prototype.getHitList = function(startX,y,endX,endY) {
    const {map, width} = this;
    const hitValues = {}, hitList = [];
    while(y<endY) {
        let x = startX;
        while(x<endX) {
            const index = x + y * width;
            const value = map[index];
            if(value && !(value in hitValues)) {
                hitValues[value] = true;
                hitList.push(value);
            }
            x++;
        }
        y++;
    }
    return hitList;
}
CollisionBase.prototype.spriteResMap = function(sprite) {
    const hitBox = spriteHitBoxFilter(sprite);

    const {tileSize} = this;
    const {x,y,width,height} = hitBox;

    const startX = Math.floor(x * tileSize);
    const startY = Math.floor(y * tileSize);

    const endX = Math.ceil((x + width) * tileSize);
    const endY = Math.ceil((y + height) * tileSize);

    return {x:startX,y:startY,endX,endY};
}
CollisionBase.prototype.checkSprite = function(sprite) {
    const {x,y,endX,endY} = this.spriteResMap(sprite);
    return this.getHitList(x,y,endX,endY);
}
CollisionBase.prototype.mapSprite = function(sprite) {
    const {x,y,endX,endY} = this.spriteResMap(sprite);
    this.write(x,y,endX,endY,sprite.ID);
}

export default CollisionBase;
