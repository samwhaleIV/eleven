function LayerCache(columns,rows) {
    const buffer = new OffscreenCanvas(0,0);
    const context = buffer.getContext("2d",{alpha:true});
    this.tileSize = null;
    this.tryUpdateSize = tileSize => {
        if(this.tileSize === tileSize) return false;
        buffer.width = columns * tileSize;
        buffer.height = rows * tileSize;
        this.tileSize = tileSize;
        return true;
    };
    this.buffer = buffer; this.context = context;
}
export default LayerCache;
