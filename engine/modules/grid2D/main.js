import Camera from "./camera.js";
import PanZoom from "./pan-zoom.js";
import DebugRenderer from "./debug-renderer.js";
import TileRenderer from "./tile-renderer/main.js";

const DEFAULT_TILE_SIZE = 16;
const SCALE_FACTOR = 15;

const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 1;

const DUMMY_RENDER_METHOD = () => {};
const RENDER_METHODS = Object.freeze([
    "renderStart","renderEnd","renderTile","renderTileOnCache","configTileRender"
]);

function Grid2D(baseTileSize=DEFAULT_TILE_SIZE) {
    const adjustedScaleFactor = SCALE_FACTOR * (DEFAULT_TILE_SIZE / baseTileSize);

    const camera = new Camera(this);
    this.camera = camera;

    const parent = this;

    this.TileRenderer = function(data) {
        TileRenderer.call(this,baseTileSize,data);
        if(data.setSize) parent.setSize(this.columns,this.rows);
        if(data.setRenderer) parent.renderer = this;
    };

    let horizontalTiles, verticalTiles, tileSize;
    let halfHorizontalTiles, halfVerticalTiles;
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

    this.baseTileSize = baseTileSize;

    this.resize = data => {
        const hasNewSizeData = data && data.size;
        if(hasNewSizeData) {
            const size = data.size;
            width = size.width;
            height = size.height;
            halfWidth = size.halfWidth;
            halfHeight = size.halfHeight;
        }

        tileSize = Math.ceil(width / adjustedScaleFactor / baseTileSize) * baseTileSize;
        tileSize = Math.floor(tileSize * camera.scale);

        if(panZoom) resizePanZoom();

        horizontalTiles = Math.ceil(width / tileSize);
        verticalTiles = Math.ceil(height / tileSize);

        if(horizontalTiles % 2 === 0) horizontalTiles++;
        if(verticalTiles % 2 === 0) verticalTiles++;

        tileXOffset = -(horizontalTiles * tileSize - width) / 2;
        tileYOffset = -(verticalTiles * tileSize - height) / 2;

        halfHorizontalTiles = horizontalTiles / 2;
        halfVerticalTiles = verticalTiles / 2;

        cameraXOffset = -Math.floor(halfHorizontalTiles);
        cameraYOffset = -Math.floor(halfVerticalTiles);
    };

    let renderer = null;
    const setRenderer = newRenderer => {
        if(!newRenderer) {
            newRenderer = new Object();
        }
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

    Object.defineProperty(this,"renderer",{
        get: () => renderer,
        set: value => {
            setRenderer(value);
        },
        enumerable: true
    });
    setRenderer();

    this.debug = () => {
        setRenderer(DebugRenderer);
    };

    let renderCache = null;
    const updateCache = () => {
        const {bufferContext} = renderCache;
        renderer.configTileRender({
            context: bufferContext,
            tileSize: baseTileSize,
            time: performance.now(),
            startX: 0, startY: 0,
            endX: gridWidth - 1,
            endY: gridHeight - 1,
            rangeX: gridWidth,
            rangeY: gridHeight
        });
        for(let y = 0;y<gridHeight;y++) {
            for(let x = 0;x<gridWidth;x++) {
                renderer.renderTile(x,y,x*baseTileSize,y*baseTileSize);
            }
        }
    };

    this.cache = () => {
        if(!renderCache) {
            const columns = gridWidth;
            const rows = gridHeight;

            const width = gridWidth * baseTileSize;
            const height = gridHeight * baseTileSize;

            const buffer = new OffscreenCanvas(width,height);
            const bufferContext = buffer.getContext("2d",{alpha:true});

            renderCache = {columns,rows,width,height,buffer,bufferContext};
        }
        updateCache();
    };
    this.decache = () => renderCache = null;

    const drawCache = context => {
        const renderX = (camera.x + cameraXOffset) * -tileSize + tileXOffset;
        const renderY = (camera.y + cameraYOffset) * -tileSize + tileYOffset;

        const {buffer, width, height, columns, rows} = renderCache;

        const renderWidth = columns * tileSize;
        const renderHeight = rows * tileSize;

        context.drawImage(
            buffer,0,0,width,height,
            renderX,renderY,renderWidth,renderHeight
        );
    };

    let iterateForCache = false;
    Object.defineProperty(this,"renderOnCache",{
        get: () => iterateForCache,
        set: value => iterateForCache = Boolean(value),
        enumerable: true
    });

    this.render = (context,size,time) => {
        const useCache = renderCache;
        camera.update(time);
        renderer.renderStart(context,size,time);
        if(renderCache) {
            drawCache(context);
            if(!iterateForCache) {
                renderer.renderEnd(context,size,time);
                return;
            }
        }

        const {width, height} = size;

        const cameraX = camera.x + cameraXOffset;
        const cameraY = camera.y + cameraYOffset;

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

        if(!useCache) {
            for(let y = startY;y<tileYEnd;y++) {
                for(let x = startX;x<tileXEnd;x++) {
                    renderer.renderTile(x,y,renderX,renderY);
                    renderX += tileSize;
                }
                renderX -= horizontalStride;
                renderY += tileSize;
            }
        } else {
            for(let y = startY;y<tileYEnd;y++) {
                for(let x = startX;x<tileXEnd;x++) {
                    renderer.renderTileOnCache(x,y,renderX,renderY);
                    renderX += tileSize;
                }
                renderX -= horizontalStride;
                renderY += tileSize;
            }
        }

        renderer.renderEnd(context,size,time);
    };

    this.bindToFrame = frame => {
        frame.resize = this.resize;
        frame.render = this.render;
    };

    Object.freeze(this);
}

export default Grid2D;
