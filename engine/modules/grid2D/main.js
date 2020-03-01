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
        const {setRenderer, setSize} = data;
        const tileRenderer = new TileRenderer(baseTileSize,data);
        if(setRenderer) {
            this.renderer = tileRenderer;
        }
        if(setSize) {
            this.setSize(tileRenderer.columns,tileRenderer.rows);
        }
        return tileRenderer;
    };

    let horizontalTiles, verticalTiles, tileSize;
    let halfHorizontalTiles, halfVerticalTiles;
    let tileXOffset, tileYOffset;
    let cameraXOffset, cameraYOffset;

    let gridWidth = DEFAULT_WIDTH;
    let gridHeight = DEFAULT_HEIGHT;

    let horizontalRenderData = null, verticalRenderData = null;

    let screenArea = null;
    const cacheArea = Object.seal({x:0,y:0,width:0,height:0});

    const updateCacheArea = () => {
        cacheArea.x = screenArea.left * baseTileSize;
        cacheArea.y = screenArea.top * baseTileSize;
        cacheArea.width = screenArea.width * baseTileSize;
        cacheArea.height = screenArea.height * baseTileSize;
    };

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

    this.debug = () => setRenderer(DebugRenderer);

    const bottomCache = new GridCache(this);
    const topCache = new GridCache(this);

    this.cache = bottomCache.cache;
    this.decache = bottomCache.decache;

    this.cacheTop = topCache.cache;
    this.decacheTop = topCache.decache;
    
    const verifyConfigTileRender = () => {
        if(!renderer.configTileRender) NO_RENDER_CONFIG_METHOD();
        return true;
    };

    const drawCache = (cache,context) => {
        const area = cacheArea;
        context.drawImage(
            cache.data.buffer,
            area.x,area.y,
            area.width,area.height,
            0,0,width,height
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
        const renderX = horizontalRenderData.renderPosition;
        const startTileX = horizontalRenderData.startTile;

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

        const xLength = right - x;
        const yLength = bottom - y;

        return {left:x,right,top:y,bottom,width:xLength,height:yLength};
    };

    this.getScreenArea = () => screenArea;
    this.getScreenPosition = getScreenPosition;

    const inBounds = (x,y,area) => {
        const {left, right, top, bottom} = area;
        return x >= left && x <= right && y >= top && y <= bottom;
    };

    const pointOnScreen = (x,y) => inBounds(x,y,screenArea);
    this.pointOnScreen = pointOnScreen;

    this.tileOnScreen = (x,y) => {
        const xStart = horizontalRenderData.startTile;
        const xEnd = horizontalRenderData.endTile - 1;

        const yStart = verticalRenderData.startTile;
        const yEnd = verticalRenderData.endTile - 1;

        return x >= xStart && x <= xEnd && y >= yStart && y <= yEnd;
    };

    this.objectOnScreen = (x,y,width,height) => {
        let count = 0;
        if(pointOnScreen(x,y)) count++; 
        if(pointOnScreen(x+width,y)) count++;
        if(pointOnScreen(x,y+height)) count++;
        if(pointOnScreen(x+width,y+height)) count++;
        return count > 0;
    };

    this.getLocation = (x,y) => {
        return {
            x: Math.floor(horizontalRenderData.renderPosition + (x - horizontalRenderData.startTile) * tileSize),
            y: Math.floor(verticalRenderData.renderPosition + (y - verticalRenderData.startTile) * tileSize)
        };
    };

    Object.defineProperty(this,"tileSize",{
        get: () => tileSize,
        enumerable: true
    });

    const renderTiles = (context,time) => {
        if(renderer.paused || !renderer.renderTile) return;
        verifyConfigTileRender();

        let renderX = horizontalRenderData.renderPosition;
        const startX = horizontalRenderData.startTile;
        const tileXEnd = horizontalRenderData.endTile;
        const horizontalStride = horizontalRenderData.renderStride;

        let renderY = verticalRenderData.renderPosition;
        const startY = verticalRenderData.startTile;
        const tileYEnd = verticalRenderData.endTile;

        renderer.configTileRender({context,tileSize,time});
        for(let y = startY;y<tileYEnd;y++) {
            for(let x = startX;x<tileXEnd;x++) {
                renderer.renderTile(x,y,renderX,renderY);
                renderX += tileSize;
            }
            renderX -= horizontalStride;
            renderY += tileSize;
        }
    };

    const updateRenderData = () => {
        horizontalRenderData = getHorizontalRenderData();
        verticalRenderData = getVerticalRenderData();
        screenArea = getScreenArea();
    };
    
    this.render = (context,size,time) => {
        if(renderer.update) renderer.update(context,size,time);

        camera.update(time);
        updateRenderData();

        if(renderer.background) renderer.background(context,size,time);

        const useBottomCache = bottomCache.isValid;
        const useTopCache = topCache.isValid;

        if(useBottomCache || useTopCache) updateCacheArea();
        if(useBottomCache) drawCache(bottomCache,context);

        if(renderer.start) renderer.start(context,size,time);

        renderTiles(context,time);
        if(renderer.render) renderer.render(context,size,time);
        if(useTopCache) drawCache(topCache,context);

        if(renderer.finalize) renderer.finalize(context,size,time);
    };

    this.bindToFrame = frame => {
        frame.resize = this.resize;
        frame.render = this.render;
    };

    Object.freeze(this);
}

export default Grid2D;
