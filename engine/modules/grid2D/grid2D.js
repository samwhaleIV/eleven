import Camera from "./camera.js";
import PanZoom from "./pan-zoom.js";
import DebugRenderer from "./debug-renderer.js";
import TileRenderer from "./tile-renderer/tile-renderer.js";
import GridCache from "./grid-cache.js";

const DEFAULT_TILE_SIZE = 16;
const DEFAULT_WIDTH = 1; const DEFAULT_HEIGHT = 1;

const NO_RENDER_CONFIG_METHOD = () => {
    throw Error("Missing config tile renderer!");
};

function Grid2D(baseTileSize=DEFAULT_TILE_SIZE) {
    this.baseTileSize = baseTileSize;

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

    let horizontalTiles, verticalTiles, tileSize, pixelSize;
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

    let highPrecisionActive = false;
    const resize = data => {
        const hasNewSizeData = data && data.size;
        if(hasNewSizeData) {
            const size = data.size;
            width = size.width;
            height = size.height;
            halfWidth = size.halfWidth;
            halfHeight = size.halfHeight;
        }

        let newSize = Math.floor(camera.scale * baseTileSize);
        if(newSize % 2 !== 0) newSize++;

        if(newSize < baseTileSize) {
            camera.setScaleUnsafe(1);
            newSize = baseTileSize;
        }
        tileSize = newSize;
        pixelSize = 1 / tileSize;

        if(panZoom) resizePanZoom();

        highPrecisionActive = tileSize % baseTileSize === 0;

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

        if(renderer.resize) renderer.resize();
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

    const drawCacheDiagnostic = (cache,context) => {
        const cameraX = camera.x + cameraXOffset;
        const cameraY = camera.y + cameraYOffset;

        const renderX = Math.floor(cameraX * -tileSize + tileXOffset);
        const renderY = Math.floor(cameraY * -tileSize + tileYOffset);

        const {buffer, width, height, columns, rows} = cache.data;

        const renderWidth = columns * tileSize;
        const renderHeight = rows * tileSize;

        context.drawImage(
            buffer,0,0,width,height,
            renderX,renderY,renderWidth,renderHeight
        );
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

    const forceToPixelSpace = value => Math.round(value / pixelSize) * pixelSize;

    const getDimensionRenderData = (dimensionSize,cameraValue,cameraOffset,renderOffset,tileLength,gridSize) => {
        cameraValue += cameraOffset;

        let startTile = Math.floor(cameraValue);
        let location = renderOffset + (startTile - cameraValue) * tileSize;
        if(highPrecisionActive) location = Math.round(location);

        let renderStride = tileLength * tileSize;

        if(location <= -tileSize) {
            location += tileSize;
            tileLength--;
            renderStride -= tileSize;
            startTile++;
        }

        if(location + renderStride < dimensionSize) {
            tileLength++;
            renderStride += tileSize;
        }

        let endTile = startTile + tileLength;

        if(startTile < 0) {
            const choppedTiles = -startTile;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            location += renderDifference;
            startTile = 0;
        }

        if(endTile > gridSize) {
            const choppedTiles = endTile - gridSize;
            const renderDifference = choppedTiles * tileSize;
            renderStride -= renderDifference;
            endTile = gridSize;
        }

        return {location,renderStride,startTile,endTile};   
    };

    const getHorizontalRenderData = () => {
        return getDimensionRenderData(width,camera.x,cameraXOffset,tileXOffset,horizontalTiles,gridWidth);
    };
    const getVerticalRenderData = () => {
        return getDimensionRenderData(height,camera.y,cameraYOffset,tileYOffset,verticalTiles,gridHeight);
    };

    const getTileLocation = (pixelX,pixelY) => {
        const renderX = horizontalRenderData.location;
        const startTileX = horizontalRenderData.startTile;

        const renderY = verticalRenderData.location;
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
    const pointOnScreen = (x,y) => {
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

    const getScreenLocation = (x,y) => {
        return {
            x: horizontalRenderData.location + (x - horizontalRenderData.startTile) * tileSize,
            y: verticalRenderData.location + (y - verticalRenderData.startTile) * tileSize
        };
    };

    const objectOnScreen = (x,y,objectWidth,objectHeight) => {

        //Fails if object is bigger than screen!!

        const screenLocation = getScreenLocation(x,y);
        x = screenLocation.x; y = screenLocation.y;

        objectWidth = Math.floor(objectWidth * tileSize);
        objectHeight = Math.floor(objectHeight * tileSize);

        const top = 0;
        const left = 0;
        const right = width;
        const bottom = height;

        let count = 0;
        const xInUpper = xInBoundsUpper(x,left,right);
        const yInUpper = yInBoundsUpper(y,top,bottom);
        const xInLower = xInBoundsLower(x + objectWidth,left,right);
        const yInLower = yInBoundsLower(y + objectHeight,top,bottom);
        
        if(xInLower && yInLower) count++;
        if(xInUpper && yInLower) count++;
        if(xInLower && yInUpper) count++;
        if(xInUpper && yInUpper) count++;

        return count > 0;
    };

    const updateRenderData = () => {
        horizontalRenderData = getHorizontalRenderData();
        verticalRenderData = getVerticalRenderData();
        tileArea = getTileArea();
    };

    const getArea = () => {
        updateRenderData();
        return tileArea;
    };

    const renderTiles = (context,time) => {
        if(renderer.paused || !renderer.renderTile) return;
        verifyConfigTileRender();

        let renderX = horizontalRenderData.location;
        const startX = horizontalRenderData.startTile;
        const tileXEnd = horizontalRenderData.endTile;
        const horizontalStride = horizontalRenderData.renderStride;

        let renderY = verticalRenderData.location;
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

    const jitterDiagnostic = (()=>{
        let lastX = 0;
        return () => {
            const loc = getScreenLocation(0,0);
            const dif = loc.x - lastX; lastX = loc.x;

            console.log("x dif",dif,"x ren str",horizontalRenderData.location,"cam x",camera.x);
        };
    })();

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

    const alignToPixels = object => {
        object.x = forceToPixelSpace(object.x);
        object.y = forceToPixelSpace(object.y);
    };

    this.render = render;
    this.resize = resize;

    this.setSize = setSize;
    this.getTileRenderer = getTileRenderer;
    this.getPanZoom = getPanZoom;
    this.getArea = getArea;
    Object.defineProperty(this,"area",{
        get: () => tileArea,
        enumerable: true
    });
    this.pointOnScreen = pointOnScreen;
    this.tileOnScreen = tileOnScreen;
    this.objectOnScreen = objectOnScreen;
    this.alignToPixels = alignToPixels;

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
