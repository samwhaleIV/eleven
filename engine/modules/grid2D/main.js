import Camera from "./camera.js";
import PanZoom from "./pan-zoom.js";
import DebugRenderer from "./debug-renderer.js";
import TileRenderer from "./tile-renderer/main.js";
import GridCache from "./grid-cache.js";

const DEFAULT_TILE_SIZE = 16;
const SCALE_FACTOR = 15;

const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 1;

const NO_RENDER_CONFIG_METHOD = () => {
    throw Error("Missing config tile renderer!");
};

function Grid2D(baseTileSize=DEFAULT_TILE_SIZE) {
    const adjustedScaleFactor = SCALE_FACTOR * (DEFAULT_TILE_SIZE / baseTileSize);

    const camera = new Camera(this);
    this.camera = camera;

    this.getTileRenderer = data => {
        const tileRenderer = new TileRenderer(baseTileSize,data);
        if(data.setSize) this.setSize(tileRenderer.columns,tileRenderer.rows);
        if(data.setRenderer) this.renderer = tileRenderer;
        return tileRenderer;
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

    const bottomCache = new GridCache(this);
    const topCache = new GridCache(this);

    this.cache = bottomCache.cache;
    this.decache = bottomCache.decache;

    this.cacheTop = topCache.cache;
    this.decacheTop = topCache.decache;
    
    let iterateForCache = false;
    Object.defineProperty(this,"renderOnCache",{
        get: () => iterateForCache,
        set: value => iterateForCache = Boolean(value),
        enumerable: true
    });

    const verifyConfigTileRender = () => {
        if(!renderer.configTileRender) NO_RENDER_CONFIG_METHOD();
        return true;
    };

    const drawCache = (cache,context) => {
        const renderX = (camera.x + cameraXOffset) * -tileSize + tileXOffset;
        const renderY = (camera.y + cameraYOffset) * -tileSize + tileYOffset;

        const {buffer, width, height, columns, rows} = cache.data;

        const renderWidth = columns * tileSize;
        const renderHeight = rows * tileSize;

        context.drawImage(
            buffer,0,0,width,height,
            renderX,renderY,renderWidth,renderHeight
        );
    };

    const getDimensionRenderData = (dimensionSize,cameraValue,cameraOffset,renderOffset,tileLength,gridSize) => {
        cameraValue += cameraOffset;

        let startTile = Math.floor(cameraValue);

        let renderPosition = Math.floor(renderOffset + (startTile - cameraValue) * tileSize);

        let renderStride = tileLength * tileSize;

        if(renderPosition <= -tileSize) {
            renderPosition += tileSize;
            tileLength--;
            renderStride -= tileSize;
            startTile++;
        }

        if(renderPosition + renderStride < dimensionSize) {
            tileLength++;
            renderStride += tileSize;
        }

        let endTile = startTile + tileLength;

        if(startTile < 0) {
            const choppedTiles = -startTile;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            renderPosition += renderDifference;
            startTile = 0;
        }

        if(endTile > gridSize) {
            const choppedTiles = endTile - gridSize;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            endTile = gridSize;
        }

        return {renderPosition,renderStride,startTile,endTile};   
    };
    const getHorizontalRenderData = () => {
        return getDimensionRenderData(width,camera.x,cameraXOffset,tileXOffset,horizontalTiles,gridWidth);
    };
    const getVerticalRenderData = () => {
        return getDimensionRenderData(height,camera.y,cameraYOffset,tileYOffset,verticalTiles,gridHeight);
    };

    const getScreenPosition = (pixelX,pixelY) => {
        const horizontalRenderData = getHorizontalRenderData();
        const renderX = horizontalRenderData.renderPosition;
        const startTileX = horizontalRenderData.startTile;

        const verticalRenderData = getVerticalRenderData();
        const renderY = verticalRenderData.renderPosition;
        const startTileY = verticalRenderData.startTile;

        pixelX -= renderX; pixelY -= renderY;

        const x = pixelX / tileSize + startTileX;
        const y = pixelY / tileSize + startTileY;

        return {x,y};
    };
    
    const getScreenArea = () => {
        const {x,y} = getScreenPosition(0,0);

        const right = x + width / tileSize;
        const bottom = y + height / tileSize;

        return {left:x,right,top:y,bottom};
    };

    this.getScreenArea = getScreenArea;
    this.getScreenPosition = getScreenPosition;

    this.onScreen = (x,y) => {
        const {left, right, top, bottom} = getScreenArea();
        return x >= left && x <= right && y >= top && y <= bottom;
    };
    
    this.render = (context,size,time) => {
        camera.update(time);
        if(renderer.renderStart) renderer.renderStart(context,size,time);

        debugPointer();

        const useBottomCache = bottomCache.isValid;

        if(useBottomCache) {
            drawCache(bottomCache,context);
            if(!iterateForCache) {
                if(topCache.isValid) drawCache(topCache,context);
                if(renderer.renderEnd) renderer.renderEnd(context,size,time);
                return;
            }
        }

        const horizontalRenderData = getHorizontalRenderData();
        let renderX = horizontalRenderData.renderPosition;
        const startX = horizontalRenderData.startTile;
        const tileXEnd = horizontalRenderData.endTile;
        const horizontalStride = horizontalRenderData.renderStride;

        const verticalRenderData = getVerticalRenderData();
        let renderY = verticalRenderData.renderPosition;
        const startY = verticalRenderData.startTile;
        const tileYEnd = verticalRenderData.endTile;

        if(!useBottomCache) {
            if(renderer.render) renderer.render(context,size,time);
            if(renderer.renderTile && verifyConfigTileRender()) {
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
            }
        } else {
            if(renderer.render) renderer.render(context,size,time);
            if(renderer.renderTileOnCache && verifyConfigTileRender()) {
                renderer.configTileRender({
                    context, tileSize, time, startX, startY, endX: tileXEnd - 1, endY: tileYEnd - 1,
                    rangeX: tileXEnd - startX, rangeY: tileYEnd - startY
                });
                for(let y = startY;y<tileYEnd;y++) {
                    for(let x = startX;x<tileXEnd;x++) {
                        renderer.renderTileOnCache(x,y,renderX,renderY);
                        renderX += tileSize;
                    }
                    renderX -= horizontalStride;
                    renderY += tileSize;
                }
            }
        }

        if(topCache.isValid) drawCache(topCache,context);
        if(renderer.renderEnd) renderer.renderEnd(context,size,time);
    };

    this.bindToFrame = frame => {
        frame.resize = this.resize;
        frame.render = this.render;
    };

    Object.freeze(this);
}

export default Grid2D;
