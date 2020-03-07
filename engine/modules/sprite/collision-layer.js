const RESOLUTION_SCALE = 1 / 4; //Lower numbers are slower

const WARN_FLOATING_TILE_SIZE = baseTileSize => {
    console.warn(`Tile size ${baseTileSize} cannot be even multiple of resolution scale ${RESOLUTION_SCALE}`);
};

function CollisionLayer(grid,layer) {
    const baseTileSize = grid.baseTileSize;

    const lowResTileSize = baseTileSize * RESOLUTION_SCALE;
    if(lowResTileSize % 1 !== 0) WARN_FLOATING_TILE_SIZE(baseTileSize);

    const width = Math.floor(grid.width * lowResTileSize);
    const height = Math.floor(grid.height * lowResTileSize);

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

    const write = (startX,y,endX,endY,value) => {
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
    };

    const reset = () => {
        for(let i = 0;i<mapSize;i++) map[i] = 0;
    };
    reset();

    const lowResMap = sprite => {
        const {x,y,width,height} = sprite;

        const startX = Math.floor(x * lowResTileSize);
        const startY = Math.floor(y * lowResTileSize);

        const endX = Math.ceil((x + width) * lowResTileSize);
        const endY = Math.ceil((y + height) * lowResTileSize);

        return {x:startX,y:startY,endX,endY};
    };

    const mapSprite = sprite => {
        const {x,y,endX,endY} = lowResMap(sprite);
        write(x,y,endX,endY,sprite.ID);
    };
    const checkSprite = sprite => {
        const {x,y,endX,endY} = lowResMap(sprite);
        const checkResult = check(x,y,endX,endY);
        return checkResult;
    };

    const updateHandler = (sprite,ID) => {
        if(sprite.collides) mapSprite(sprite,ID);
    };

    const update = () => {
        reset();
        layer.forEach(updateHandler);
    };

    //World's Best Coffee- I mean styling
    const narrowBand = (a,b) => {
 return !(a.x + a.width <= b.x  ||
          a.y + a.height <= b.y ||
          a.x >= b.x + b.width  ||
          a.y >= b.y + b.height
    )};
    //(Styling guides are for posers)

    const collides = sprite => {
        const readValue = checkSprite(sprite);
        if(!readValue) return null;
        const whoWeHitUp = layer.get(readValue);
        if(!narrowBand(sprite,whoWeHitUp)) return null;
        return whoWeHitUp;
    };

    this.update = update;
    this.reset = reset;
    this.collides = collides;

    /*
    (()=>{  
        //Debug...

        const bufferWidth = width;
        const bufferHeight = height;
        const buffer = new OffscreenCanvas(bufferWidth,bufferHeight);
        const bufferContext = buffer.getContext("2d",{alpha:true});
        
        this.render = (context,size) => {
            bufferContext.fillStyle = "rgba(255,128,255)";
            bufferContext.beginPath();
            for(let x = 0;x<bufferWidth;x++) {
                for(let y = 0;y<bufferHeight;y++) {
                    if(read(x,y)) {
                        bufferContext.rect(x,y,1,1);
                    }
                }
            }
            bufferContext.fill();

            const {left,top,width,height} = grid.area;
            const scale = lowResTileSize;
            context.save();
            context.globalAlpha = 0.5;
            context.drawImage(
                buffer,
                left * scale,top * scale,
                width * scale,height * scale,
                0,0,size.width,size.height
            );
            context.restore();
        };
    })();
    */
}

export default CollisionLayer;

