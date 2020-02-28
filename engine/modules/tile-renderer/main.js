import ParseRenderInformation from "./parse.js";

function TileRenderer(grid,data) {
    const {
        columns, rows,
        layerCount, layerSize,
        renderData, backgroundColor,
        skipZero, renderLayerCount
    } = ParseRenderInformation(data);

    const renderLayerEnd = Math.min(layerCount,renderLayerCount);

    renderData.map = mapper => {
        for(let i = 0;i<renderData.length;i++) {
            renderData[i] = mapper(renderData[i],i);
        }
    };
    grid.setSize(columns,rows);

    let textureColumns = 0, textureRows = 0;
    let textureCount = 0, textureSize = 0;
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
            let layer = 0;
            do {
                const mapValue = renderData[tileIndex + layer * layerSize];
                if(mapValue !== 0) renderTexture(mapValue,renderX,renderY);
                layer++;
            } while(layer < renderLayerEnd);
        };
    } else {
        this.renderTile = (x,y,renderX,renderY) => {
            const tileIndex = getIdx(x,y);
            let layer = 0;
            do {
                const mapValue = renderData[tileIndex + layer * layerSize];
                renderTexture(mapValue,renderX,renderY);
                layer++;
            } while(layer < renderLayerEnd);
        };
    }

    this.renderStart = (context,{width,height}) => {
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,width,height);
    };

    const refreshTextureCache = () => {
        textureCache.splice(0);
        for(let i = 0;i<textureCount;i++) {
            const textureX = i % textureColumns * textureSize;
            const textureY = Math.floor(i / textureColumns) * textureSize;
            textureCache.push(textureX,textureY);
        }
    };

    const parseTextureMetadata = () => {
        const tileSize = grid.baseTileSize;
        textureColumns = tileset.width / tileSize;
        textureRows = tileset.height / tileSize;
        textureCount = textureRows * textureColumns;
        textureSize = tileSize;
    };

    const setTileset = newTileset => {
        tileset = newTileset;
        if(!tileset) return;
        parseTextureMetadata();
        refreshTextureCache();
    };

    Object.defineProperties(this,{
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
        }
    });
}

export default TileRenderer;
