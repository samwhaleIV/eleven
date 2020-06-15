import ParseGrid2DMap from "./parse.js";

function TileRenderer(textureSize,data) {
    let includedTileset = data.tileset;
    data = ParseGrid2DMap(data);
    const {
        columns, rows,
        layerCount, layerSize,
        renderData, skipZero,
    } = data;
    Object.seal(renderData);

    let renderLayerCount = 0;
    let renderLayerStart = 0;
    let renderLayerEnd = 0;

    this.setLayerRange = (start,length) => {
        renderLayerCount = length;
        renderLayerStart = start;
        renderLayerEnd = renderLayerStart + renderLayerCount;
    };

    let textureColumns = 0, textureRows = 0, textureCount = 0;
    let tileset = null, textureCache = new Array();

    const getIdx = (x,y) => {
        return x + y * columns;
    };
    const getLayerIdx = (x,y,layer) => {
        const layerOffset = layer * layerSize;
        return x + y * columns + layerOffset;
    };
    this.setTile = (x,y,value,layer=0) => {
        const idx = getLayerIdx(x,y,layer);
        renderData[idx] = value;
    };
    this.getTile = (x,y,layer=0) => {
        const idx = getLayerIdx(x,y,layer);
        return renderData[idx];
    };
    this.getXY = idx => {
        const x = idx % columns;
        const y = Math.floor(idx / columns);
        return [x,y];
    };
    this.getIdx = getIdx;

    let context, tileSize;
    this.configTileRender = data => {
        context = data.context;
        tileSize = data.tileSize;
    };

    const renderTexture = (tileIndex,renderX,renderY) => {
        tileIndex *= 2;
        const textureX = textureCache[tileIndex];
        const textureY = textureCache[tileIndex + 1];
        context.drawImage(
            tileset,textureX,textureY,textureSize,textureSize,
            renderX,renderY,tileSize,tileSize
        );
    };

    if(skipZero) {
        this.renderTile = (x,y,renderX,renderY) => {
            const tileIndex = getIdx(x,y);
            let layer = renderLayerStart;
            do {
                const mapValue = renderData[tileIndex + layer * layerSize];
                if(mapValue !== 0) renderTexture(mapValue,renderX,renderY);
                layer++;
            } while(layer < renderLayerEnd);
        };
    } else {
        this.renderTile = (x,y,renderX,renderY) => {
            const tileIndex = getIdx(x,y);
            let layer = renderLayerStart;
            do {
                const mapValue = renderData[tileIndex + layer * layerSize];
                renderTexture(mapValue,renderX,renderY);
                layer++;
            } while(layer < renderLayerEnd);
        };
    }

    const refreshTextureCache = () => {
        textureCache.splice(0);
        for(let i = 0;i<textureCount;i++) {
            const textureX = i % textureColumns * textureSize;
            const textureY = Math.floor(i / textureColumns) * textureSize;
            textureCache.push(textureX,textureY);
        }
    };

    const parseTextureMetadata = () => {
        textureColumns = tileset.width / textureSize;
        textureRows = tileset.height / textureSize;
        textureCount = textureRows * textureColumns;
    };

    const setTileset = newTileset => {
        tileset = newTileset;
        if(!tileset) return;
        parseTextureMetadata();
        refreshTextureCache();
    };

    if(includedTileset) setTileset(includedTileset);
    includedTileset = null;

    const readLayer = layerIndex => {
        const start = getLayerIdx(0,0,layerIndex);
        return renderData.slice(start,start+layerSize);
    };
    this.readLayer = readLayer;

    let paused = false;
    Object.defineProperties(this,{
        paused: {
            get: () => paused,
            set: value => paused = Boolean(value),
            enumerable: true
        },
        tileset: {
            get: () => tileset,
            set: setTileset,
            enumerable: true
        },
        textureColumns: {
            get: () => textureColumns,
            enumerable: true
        },
        textureRows: {
            get: () => textureRows,
            enumerable: true
        },
        textureCount: {
            get: () => textureCount,
            enumerable: true
        },
        columns: {
            get: () => columns,
            enumerable: true
        },
        rows: {
            get: () => rows,
            enumerable: true
        },
        renderData: {
            value: renderData,
            enumerable: true
        },
        layerStart: {
            get: () => renderLayerStart,
            enumerable: true
        },
        maxLayerCount: {
            get: () => layerCount,
            enumerable: true
        },
        layerCount: {
            get: () => renderLayerCount,
            enumerable: true
        }
    });
}

export default TileRenderer;
