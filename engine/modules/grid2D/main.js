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
    this.baseTileSize = baseTileSize;
    const adjustedScaleFactor = SCALE_FACTOR * (DEFAULT_TILE_SIZE / baseTileSize);

    let gridWidth = DEFAULT_WIDTH;
    let gridHeight = DEFAULT_HEIGHT;

    const setSize = (width,height) => {
        gridWidth = width;
        gridHeight = height;
    };

    let renderer = new Object();
    const setRenderer = newRenderer => {
        if(!newRenderer) {
            newRenderer = new Object();
        }
        if(typeof newRenderer === "function") {
            newRenderer = new newRenderer(this);
        }
        renderer = newRenderer;
    };

    const camera = new Camera(this);
    this.camera = camera;

    const getTileRenderer = data => {
        const shouldSetSize = data.setSize;
        const shouldSetRenderer = data.setRenderer;
        const tileRenderer = new TileRenderer(baseTileSize,data);
        if(shouldSetRenderer) {
            this.renderer = tileRenderer;
        }
        if(shouldSetSize) {
            setSize(tileRenderer.columns,tileRenderer.rows);
        }
        return tileRenderer;
    };

    let horizontalTiles, verticalTiles, tileSize;
    let halfHorizontalTiles, halfVerticalTiles;
    let tileXOffset, tileYOffset;
    let cameraXOffset, cameraYOffset;

    Object.defineProperties(this,{
        renderer: {
            get: () => renderer,
            set: setRenderer,
            enumerable: true
        },
        width: {
            get: () => gridWidth,
            set: value => gridWidth = value,
            enumerable: true
        },
        height: {
            get: () => gridHeight,
            set: value => gridHeight = value,
            enumerable: true
        },
        tileSize: {
            get: () => tileSize,
            enumerable: true
        }
    });

    let horizontalRenderData = null, verticalRenderData = null;

    let tileArea = null;
    const cacheArea = Object.seal({x:0,y:0,width:0,height:0});

    const updateCacheArea = () => {
        cacheArea.x = tileArea.left * baseTileSize;
        cacheArea.y = tileArea.top * baseTileSize;
        cacheArea.width = tileArea.width * baseTileSize;
        cacheArea.height = tileArea.height * baseTileSize;
    };

    let width = 0, height = 0;
    let halfWidth = 0, halfHeight = 0;

    let panZoom = null;
    const resizePanZoom = () => {
        panZoom.resize({halfWidth,halfHeight,tileSize});
    };
    const getPanZoom = () => {
        if(!panZoom) {
            panZoom = new PanZoom(camera);
            resizePanZoom();
        }
        return panZoom;
    };

    const resize = data => {
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
        if(tileSize % 2 !== 0) tileSize++;

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

    const bottomCache = new GridCache(this);
    const topCache = new GridCache(this);

    const cacheProcessor = function(cache,...data) {
        if(data.length) {
            const [x,y,width,height] = data;
            cache.cacheArea(x,y,width,height);
        } else {
            cache.cache();
        }
    };
    const decacheProcessor = function(cache,...data) {
        if(data.length) {
            const [x,y,width,height] = data;
            cache.clearArea(x,y,width,height);
        } else {
            cache.decache();
        }
    };
    
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

        let renderLocation = Math.floor(renderOffset + (startTile - cameraValue) * tileSize);

        let renderStride = tileLength * tileSize;

        if(renderLocation <= -tileSize) {
            renderLocation += tileSize;
            tileLength--;
            renderStride -= tileSize;
            startTile++;
        }

        if(renderLocation + renderStride < dimensionSize) {
            tileLength++;
            renderStride += tileSize;
        }

        let endTile = startTile + tileLength;

        if(startTile < 0) {
            const choppedTiles = -startTile;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            renderLocation += renderDifference;
            startTile = 0;
        }

        if(endTile > gridSize) {
            const choppedTiles = endTile - gridSize;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            endTile = gridSize;
        }

        return {renderLocation,renderStride,startTile,endTile};   
    };

    const getHorizontalRenderData = () => {
        return getDimensionRenderData(width,camera.x,cameraXOffset,tileXOffset,horizontalTiles,gridWidth);
    };
    const getVerticalRenderData = () => {
        return getDimensionRenderData(height,camera.y,cameraYOffset,tileYOffset,verticalTiles,gridHeight);
    };

    const getTileLocation = (pixelX,pixelY) => {
        const renderX = horizontalRenderData.renderLocation;
        const startTileX = horizontalRenderData.startTile;

        const renderY = verticalRenderData.renderLocation;
        const startTileY = verticalRenderData.startTile;

        pixelX -= renderX; pixelY -= renderY;

        const x = pixelX / tileSize + startTileX;
        const y = pixelY / tileSize + startTileY;

        return {x,y};
    };
    const getTileArea = () => {
        const {x,y} = getTileLocation(0,0);

        const right = x + width / tileSize;
        const bottom = y + height / tileSize;

        const xLength = right - x;
        const yLength = bottom - y;

        return {left:x,right,top:y,bottom,width:xLength,height:yLength};
    };
    const pointInBounds = (x,y) => {
        const {left, right, top, bottom} = tileArea;
        return x >= left && x < right && y >= top && y < bottom;
    };
    const xInBoundsUpper = (x,left,right) => {
        return x >= left && x < right;
    };
    const yInBoundsUpper = (y,top,bottom) => {
        return y >= top && y < bottom;
    };
    const xInBoundsLower = (x,left,right) => {
        return x > left && x <= right;
    };
    const yInBoundsLower = (y,top,bottom) => {
        return y > top && y <= bottom;
    };
    const tileOnScreen = (x,y) => {
        const xStart = horizontalRenderData.startTile;
        const xEnd = horizontalRenderData.endTile - 1;

        const yStart = verticalRenderData.startTile;
        const yEnd = verticalRenderData.endTile - 1;

        return x >= xStart && x <= xEnd && y >= yStart && y <= yEnd;
    };
    const objectOnScreen = (x,y,width,height) => {
        const {top, left, bottom, right} = tileArea;
        let count = 0;

        const xInUpper = xInBoundsUpper(x,left,right);
        const yInUpper = yInBoundsUpper(y,top,bottom);
        const xInLower = xInBoundsLower(x + width,left,right);
        const yInLower = yInBoundsLower(y + height,top,bottom);
        
        if(xInLower && yInLower) count++;
        if(xInUpper && yInLower) count++;
        if(xInLower && yInUpper) count++;
        if(xInUpper && yInUpper) count++;

        return count > 0;
    };
    const getScreenLocation = (x,y) => {
        return {
            x: Math.floor(horizontalRenderData.renderLocation + (x - horizontalRenderData.startTile) * tileSize),
            y: Math.floor(verticalRenderData.renderLocation + (y - verticalRenderData.startTile) * tileSize)
        };
    };
    const getArea = () => tileArea;

    const renderTiles = (context,time) => {
        if(renderer.paused || !renderer.renderTile) return;
        verifyConfigTileRender();

        let renderX = horizontalRenderData.renderLocation;
        const startX = horizontalRenderData.startTile;
        const tileXEnd = horizontalRenderData.endTile;
        const horizontalStride = horizontalRenderData.renderStride;

        let renderY = verticalRenderData.renderLocation;
        const startY = verticalRenderData.startTile;
        const tileYEnd = verticalRenderData.endTile;

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
    };

    const updateRenderData = () => {
        horizontalRenderData = getHorizontalRenderData();
        verticalRenderData = getVerticalRenderData();
        tileArea = getTileArea();
    };

    const render = (context,size,time) => {
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

    const bindToFrame = frame => {
        frame.resize = resize;
        frame.render = render;
    };

    this.render = render;
    this.resize = resize;

    this.setSize = setSize;
    this.getTileRenderer = getTileRenderer;
    this.getPanZoom = getPanZoom;
    this.getArea = getArea;
    this.pointInBounds = pointInBounds;
    this.tileOnScreen = tileOnScreen;
    this.objectOnScreen = objectOnScreen;

    this.getLocation = getScreenLocation; //Inputs tile space, outputs pixel space
    this.getTileLocation = getTileLocation; //Inputs pixel space, outputs tile space

    this.cache = cacheProcessor.bind(this,bottomCache);
    this.decache = decacheProcessor.bind(this,bottomCache);
    this.cacheTop = cacheProcessor.bind(this,topCache);
    this.decacheTop = decacheProcessor.bind(this,topCache);
    this.bindToFrame = bindToFrame;

    this.debug = () => setRenderer(DebugRenderer);
    Object.freeze(this);
}

export default Grid2D;
