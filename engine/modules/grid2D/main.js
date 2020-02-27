import Camera from "./camera.js";
import PanZoom from "./pan-zoom.js";
import DebugRenderer from "./debug-renderer.js";

const TILE_SIZE = 16;
const SCALE_FACTOR = 15;

const DEFAULT_WIDTH = 64;
const DEFAULT_HEIGHT = 64;

const DUMMY_RENDER_METHOD = () => {};
const RENDER_METHODS = Object.freeze([
    "renderStart","renderEnd","renderTile","configTileRender"
]);

function Grid2D() {

    const camera = new Camera(this);
    this.camera = camera;

    let horizontalTiles, verticalTiles, tileSize;
    let tileXOffset, tileYOffset;
    let cameraXOffset, cameraYOffset;

    let gridWidth = DEFAULT_WIDTH;
    let gridHeight = DEFAULT_HEIGHT;

    Object.defineProperty(this,"width",{
        get: () => gridWidth,
        set: value => gridWidth = value,
        enumerable: true
    });
    Object.defineProperty(this,"height",{
        get: () => gridHeight,
        set: value => gridHeight = value,
        enumerable: true
    });
    this.setSize = (width,height) => {
        gridWidth = width;
        gridHeight = height;
    };

    let width = 0, height = 0;
    let halfWidth = 0, halfHeight = 0;

    let panZoom = null;
    const resizePanZoom = () => {
        panZoom.resize({halfWidth,halfHeight,tileSize});
    };
    this.getPanZoom = () => {
        if(!panZoom) {
            panZoom = new PanZoom(camera);
            resizePanZoom();
        }
        return panZoom;
    };

    this.resize = data => {
        const hasNewSizeData = data && data.size;
        if(hasNewSizeData) {
            const size = data.size;
            width = size.width;
            height = size.height;
            halfWidth = size.halfWidth;
            halfHeight = size.halfHeight;
        }

        tileSize = Math.ceil(width / SCALE_FACTOR / TILE_SIZE) * TILE_SIZE;
        tileSize = Math.floor(tileSize * camera.scale);

        if(panZoom) resizePanZoom();

        horizontalTiles = Math.ceil(width / tileSize);
        verticalTiles = Math.ceil(height / tileSize);

        if(horizontalTiles % 2 === 0) horizontalTiles++;
        if(verticalTiles % 2 === 0) verticalTiles++;

        tileXOffset = -(horizontalTiles * tileSize - width) / 2;
        tileYOffset = -(verticalTiles * tileSize - height) / 2;

        cameraXOffset = -Math.floor(horizontalTiles / 2);
        cameraYOffset = -Math.floor(verticalTiles / 2);
    };

    let renderer = new Object();
    this.setRenderer = newRenderer => {
        if(typeof newRenderer === "function") {
            newRenderer = new newRenderer(this);
        }
        for(let i = 0;i<RENDER_METHODS.length;i++) {
            const renderMethod = RENDER_METHODS[i];
            if(!(renderMethod in newRenderer)) {
                newRenderer[renderMethod] = DUMMY_RENDER_METHOD;
            }
        }
        renderer = newRenderer;
    };
    this.setRenderer(renderer);

    this.debug = () => {
        this.setRenderer(DebugRenderer);
    };

    this.render = (context,size,time) => {
        const {width, height} = size;
        renderer.renderStart(context,size,time);
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

        if(renderX <= -tileSize) {
            renderX += tileSize;
            horizontalLength--;
            horizontalStride -= tileSize;
            startX++;
        }
        if(renderY <= -tileSize) {
            renderY += tileSize;
            verticalLength--;
            startY++;
        }
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

        renderer.configTileRender({
            context, tileSize, time, startX, startY, endX: tileXEnd - 1, endY: tileYEnd - 1,
            rangeX: tileXEnd - startX, rangeY: tileYEnd - startY
        });

        for(let y = startY;y<tileYEnd;y++) {
            for(let x = startX;x<tileXEnd;x++) {
                renderer.renderTile(x,y,renderX,renderY);
                renderX += tileSize;
            }
            renderX -= horizontalStride;
            renderY += tileSize;
        }

        renderer.renderEnd(context,size,time);
    };

    Object.freeze(this);
}

export default Grid2D;
