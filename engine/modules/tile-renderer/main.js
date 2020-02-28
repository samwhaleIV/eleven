const DEFAULT_BACKGROUND_COLOR = "black";

function ParseRenderInformation(data={}) {
    let width = 0;
    let height = 0;
    const backgroundColor = data.backgroundColor || DEFAULT_BACKGROUND_COLOR;

    const layerCount = data.layers || 1;
    const layers = new Array(layerCount);

    if(data.data) {
        //todo - parse compiled data

    } else if(data.width && data.height) {
        width = data.width;
        height = data.height;
        const tileCount = width * height;
        for(let i = 0;i<layerCount;i++) {
            layers[i] = new Array(tileCount);
        }
    }

    return {
        backgroundColor,
        renderData: layers,
        layers: layers.length,
        columns: width,
        rows: height
    };
}

function TileRenderer(grid,data) {
    const {columns, rows, layers, renderData, backgroundColor} = ParseRenderInformation(data);
    grid.setSize(columns,rows);

    let textureColumns = 0;
    let textureRows = 0;
    let textureCount = 0;

    let textureSize = 0;
    let tileset = null;

    Object.defineProperty(this,"tileset",{
        get: () => tileset,
        set: value => {
            tileset = value;
            if(!value) return;
            const tileSize = grid.baseTileSize;
            textureColumns = tileset.width / tileSize;
            textureRows = tileset.height / tileSize;
            textureCount = textureRows * textureColumns;
            textureSize = tileSize;
        }
    });
    Object.defineProperty(this,"textureColumns",{
        get: () => textureColumns,
        enumerable: true
    });
    Object.defineProperty(this,"textureRows",{
        get: () => textureRows,
        enumerable: true
    });
    Object.defineProperty(this,"textureCount",{
        get: () => textureCount,
        enumerable: true
    });

    let context, tileSize;
    this.configTileRender = data => {
        context = data.context;
        tileSize = data.tileSize;
    };

    const renderTexture = (tileIndex,renderX,renderY) => {
        const textureX = tileIndex % textureColumns * textureSize;
        const textureY = Math.floor(tileIndex / textureColumns) * textureSize;

        context.drawImage(
            tileset,textureX,textureY,textureSize,textureSize,
            renderX,renderY,tileSize,tileSize
        );
    };

    this.renderTile = (x,y,renderX,renderY) => {
        const tileIndex = x + y * columns;
        let i = 0;
        do {
            const layer = renderData[i];
            renderTexture(layer[tileIndex],renderX,renderY);
            i++;
        } while(i < layers);
    };
    this.renderStart = (context,{width,height}) => {
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,width,height);
    };

    Object.defineProperty(this,"renderData",{
        value: renderData,
        enumerable: true
    });
}
export default TileRenderer;
