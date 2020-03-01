const NO_CACHE_TO_CLEAR = () => {
    throw Error("Cannot clear an area of the cache because there is no cache data!");
};

function GridCache(grid) {
    const baseTileSize = grid.baseTileSize;

    this.isValid = false;
    this.data = null;

    const clearBufferArea = (x,y,width,height) => {
        const areaWidth = width * baseTileSize;
        const areaHeight = height * baseTileSize;

        const areaX = x * baseTileSize;
        const areaY = y * baseTileSize;

        this.data.bufferContext.clearRect(
            areaX,areaY,areaWidth,areaHeight
        );
    };

    const limitWidth = (startX,width) => Math.min(width,grid.width-startX);
    const limitHeight = (startY,height) => Math.min(height,grid.height-startY);

    const updateCache = (startX,startY,width,height) => {

        width = limitWidth(startX,width);
        height = limitHeight(startY,height);

        clearBufferArea(startX,startY,width,height);

        const endX = startX + width;
        const endY = startY + height;

        const renderer = grid.renderer;
        const {bufferContext} = this.data;

        renderer.configTileRender({
            context: bufferContext,
            tileSize: baseTileSize,
            startX, startY,
            endX: endX - 1, endY: endY - 1,
            rangeX: endX - startX,
            rangeY: endY - startY,
            time: {now: performance.now(), delta: 0}
        });
        for(let y = startY;y<endY;y++) {
            for(let x = startX;x<endX;x++) {
                renderer.renderTile(x,y,x*baseTileSize,y*baseTileSize);
            }
        }
    };
    const updateCacheFull = () => updateCache(0,0,grid.width,grid.height);
    const hasCacheData = () => Boolean(this.data);

    const insureCache = () => {
        if(!hasCacheData()) {
            const width = grid.width * baseTileSize;
            const height = grid.height * baseTileSize;

            const buffer = new OffscreenCanvas(width,height);
            const bufferContext = buffer.getContext("2d",{alpha:true});

            this.isValid = true;
            this.data = {buffer,bufferContext};
        }
    };

    const cache = () => {
        insureCache();
        updateCacheFull();
    };

    const cacheArea = (x,y,width,height) => {
        insureCache();
        updateCache(x,y,width,height);
    };

    const clearArea = (x,y,width,height) => {
        if(!hasCacheData()) NO_CACHE_TO_CLEAR();
        width = limitWidth(x,width);
        height = limitHeight(y,height);
        clearBufferArea(x,y,widt,height);
    };

    const decache = () => {
        this.data = null;
        this.isValid = false;
    };

    this.cacheArea = cacheArea;
    this.clearArea = clearArea;
    this.cache = cache;
    this.decache = decache
    Object.seal(this);
}
export default GridCache;
