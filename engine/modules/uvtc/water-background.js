function WaterBackground(
    grid,texture,textureX,textureY,scrollDuration
) {
    this.textureX = textureX, this.textureY = textureY;
    this.scrollDuration = scrollDuration;

    let size, pattern;

    const offscreenCanvas = new OffscreenCanvas(0,0);
    const offscreenContext = offscreenCanvas.getContext("2d");
    offscreenContext.imageSmoothingEnabled = false;

    let xOffset = 0, yOffset = 0;

    this.resize = () => {
        size = grid.tileSize;

        offscreenCanvas.width = size, offscreenCanvas.height = size;

        offscreenContext.imageSmoothingEnabled = false;
        offscreenContext.drawImage(
            texture,
            this.textureX,this.textureY,grid.baseTileSize,grid.baseTileSize,
            0,0,size,size
        );

        pattern = offscreenContext.createPattern(offscreenCanvas,"repeat");
    }

    this.install = dispatchRenderer => {
        dispatchRenderer.addResize(this.resize);
        dispatchRenderer.addBackground(this.render);
    };

    this.render = (context,{width,height},time) => {
        const offset = time.now / this.scrollDuration;// / 1;

        const cameraX = grid.camera.x, cameraY = grid.camera.y;

        const xOffsetDistance = offset + cameraX;
        const yOffsetDistance = offset + cameraY;

        context.fillStyle = pattern;
        context.beginPath();
        context.rect(0,0,width,height);
        context.save();
        context.imageSmoothingEnabled = true;
        context.translate(
            -xOffsetDistance * size + xOffset,
            -yOffsetDistance * size + yOffset
        );
        context.fill();
        context.restore();

        context.fillStyle = pattern;
        context.save();
        context.imageSmoothingEnabled = true;
        context.translate(
            (offset - cameraX) * size + xOffset,
            -cameraY * size + yOffset
        );
        context.globalCompositeOperation = "lighter";
        context.scale(-1,-1);
        context.fill();
        context.restore();
        context.closePath();
    }
}

export default WaterBackground;
