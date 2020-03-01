function GridCache(grid) {
    const baseTileSize = grid.baseTileSize;

    this.isValid = false;
    this.data = null;

    const updateCache = () => {
        const renderer = grid.renderer;
        const gridWidth = grid.width;
        const gridHeight = grid.height;

        const {bufferContext, width, height} = this.data;

        bufferContext.clearRect(0,0,width,height);
        renderer.configTileRender({
            context: bufferContext,
            tileSize: baseTileSize,
            time: {
                now: performance.now(),
                delta: 0
            }
        });
        for(let y = 0;y<gridHeight;y++) {
            for(let x = 0;x<gridWidth;x++) {
                renderer.renderTile(x,y,x*baseTileSize,y*baseTileSize);
            }
        }
    };

    this.cache = () => {
        if(!this.data) {
            const gridWidth = grid.width;
            const gridHeight = grid.height;

            const width = gridWidth * baseTileSize;
            const height = gridHeight * baseTileSize;

            const buffer = new OffscreenCanvas(width,height);
            const bufferContext = buffer.getContext("2d",{alpha:true});

            this.isValid = true;
            this.data = {width,height,buffer,bufferContext};
        }
        updateCache();
    };
    this.decache = () => {
        this.data = null;
        this.isValid = false;
    };

    Object.seal(this);
}
export default GridCache;
