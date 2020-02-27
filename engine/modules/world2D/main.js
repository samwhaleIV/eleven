import Camera from "./camera.js";

const TILE_SIZE = 16;
const SCALE_FACTOR = 15;

function World2D() {

    const camera = new Camera(this);
    this.camera = camera;

    let horizontalTiles, verticalTiles, tileSize;
    let tileXOffset, tileYOffset;
    let cameraXOffset, cameraYOffset;

    let gridWidth = 10;//temp
    let gridHeight = 10;//temp

    let width, height;

    this.resize = (_,size) => {
        if(size) {
            width = size.width;
            height = size.height;
        }

        tileSize = Math.ceil(width / SCALE_FACTOR / TILE_SIZE) * TILE_SIZE;
        tileSize = Math.floor(tileSize * camera.scale);

        horizontalTiles = Math.ceil(width / tileSize);
        verticalTiles = Math.ceil(height / tileSize);

        if(horizontalTiles % 2 === 0) horizontalTiles++;
        if(verticalTiles % 2 === 0) verticalTiles++;

        tileXOffset = -(horizontalTiles * tileSize - width) / 2;
        tileYOffset = -(verticalTiles * tileSize - height) / 2;

        cameraXOffset = -Math.floor(horizontalTiles / 2);
        cameraYOffset = -Math.floor(verticalTiles / 2);
    };

    this.render = (context,{width,height},time) => {

        context.fillStyle = "purple";
        context.fillRect(0,0,width,height);
        camera.update(time);

        const cameraX = this.camera.x + cameraXOffset;
        const cameraY = this.camera.y + cameraYOffset;

        let startX = Math.floor(cameraX);
        let startY = Math.floor(cameraY);

        let renderX = Math.floor(tileXOffset + (startX - cameraX) * tileSize);
        let renderY = Math.floor(tileYOffset + (startY - cameraY) * tileSize);
        
        let horizontalLength = horizontalTiles;
        let verticalLength = verticalTiles;
        let horizontalStride = horizontalLength * tileSize;

        if(renderX + horizontalStride < width) {
            horizontalLength++;
            horizontalStride += tileSize;
        }
        if(renderY + verticalLength * tileSize < height) {
            verticalLength++;
        }

        let tileXEnd = startX + horizontalLength;
        let tileYEnd = startY + verticalLength;

        if(startX < 0) {
            const choppedTiles = -startX;
            const renderDifference = choppedTiles * tileSize
            horizontalStride -= renderDifference;
            renderX += renderDifference;
            startX = 0;
        }
        if(tileXEnd > gridWidth) {
            const choppedTiles = tileXEnd - gridWidth;
            const renderDifference = choppedTiles * tileSize;
            horizontalStride -= renderDifference;
            tileXEnd = gridWidth;
        }

        if(startY < 0) {
            const choppedTiles = -startY;
            const renderDifference = choppedTiles * tileSize;
            renderY += renderDifference;
            startY = 0;
        }
        if(tileYEnd > gridHeight) {
            tileYEnd = gridHeight;
        }

        for(let y = startY;y<tileYEnd;y++) {
            for(let x = startX;x<tileXEnd;x++) {

                if((x + y) % 2 === 0) {
                    context.fillStyle = "black";
                } else {
                    context.fillStyle = "white";
                }

                context.fillRect(renderX,renderY,tileSize,tileSize);
                renderX += tileSize;
            }
            renderX -= horizontalStride;
            renderY += tileSize;
        }
    };

    Object.freeze(this);
}

export default World2D;
