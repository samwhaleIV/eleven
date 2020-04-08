function TileSprite(x,y,texture,textureColumn,textureRow,tileSize) {
    const textureX = textureColumn * tileSize, textureY = textureRow * tileSize;

    this.x = x, this.y = y;

    this.width = 1, this.height = 1;

    this.render = (context,x,y,width,height) => {
        context.drawImage(texture,textureX,textureY,tileSize,tileSize,x,y,width,height);
    };
}
export default TileSprite;
