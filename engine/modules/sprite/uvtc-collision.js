const COLLISION_LAYER = 2;

function UVTCCollision(grid,tileRenderer) {
    const {width, height} = grid;

    const mapSize = width * height;
    const map = new Array(mapSize);

    const check = (startX,y,endX,endY) => {
        while(y<endY) {
            let x = startX;
            while(x<endX) {
                const index = x + y * width;
                const value = map[index];
                if(value) return value;
                x++;
            }
            y++;
        }
        return 0;
    };

    let lookupCounter = 1;
    const lookup = new Array();

    const reset = () => {
        const layer = tileRenderer.readLayer(COLLISION_LAYER);
        for(let i = 0;i<mapSize;i++) {
            const value = layer[i];
            if(value) {
                map[i] = lookupCounter;
                lookup[lookupCounter] = {
                    x: i % width,
                    y: Math.floor(i / width),
                    width: 1,
                    height: 1,
                    value: value
                };
                lookupCounter++;
            } else {
                map[i] = value;
            }
        }
    };
    reset();

    const lowResMap = sprite => {
        const {x,y,width,height} = sprite;

        const startX = Math.floor(x);
        const startY = Math.floor(y);

        const endX = Math.ceil((x + width));
        const endY = Math.ceil((y + height));

        return {x:startX,y:startY,endX,endY};
    };

    const checkSprite = sprite => {
        const {x,y,endX,endY} = lowResMap(sprite);
        const checkResult = check(x,y,endX,endY);
        return checkResult;
    };

    const narrowBand = (a,b) => {
 return !(a.x + a.width <= b.x  ||
          a.y + a.height <= b.y ||
          a.x >= b.x + b.width  ||
          a.y >= b.y + b.height
    )};

    const collides = sprite => {
        const lookupValue = checkSprite(sprite);
        if(!lookupValue) return null;
        const whereWeHitUp = lookup[lookupValue];
        if(!narrowBand(sprite,whereWeHitUp)) return null;
        return whereWeHitUp;
    };

    this.reset = reset;
    this.collides = collides;
}

export default UVTCCollision;
