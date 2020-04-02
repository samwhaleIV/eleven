function TileSprite(x,y,texture,textureX,textureY,tileSize) {

    this.x = x, this.y = y;

    this.width = 1, this.height = 1;

    this.render = (context,x,y,width,height) => {
        context.drawImage(texture,textureX,textureY,tileSize,tileSize,x,y,width,height);
    };
}
export default TileSprite;
