import LightCache from "./light-cache.js";
import LayerCache from "./layer-cache.js";

const LIGHTING_LAYER_ID = 4;
const LIGHTING_TILE_SCALE = 2;

function UVTCLighting(grid,tileRenderer) {
    if(tileRenderer.maxLayerCount < LIGHTING_LAYER_ID) {
        this.hasLighting = false;
        Object.freeze(this);
        return;
    }
    this.hasLighting = true;
    const lightCache = new LightCache();
    let lightingLayer = null;
    const updateLightingLayer = () => {
        lightingLayer = tileRenderer.readLayer(LIGHTING_LAYER_ID - 1);
    };
    updateLightingLayer();

    const {columns, rows} = tileRenderer;

    const layerCache = new LayerCache(columns,rows);

    const renderTile = (x,y,renderX,renderY) => {
        const layerIndex = x + y * columns;
        const mapValue = lightingLayer[layerIndex];
        if(mapValue < 1) return;
        lightCache.render(layerCache.context,renderX,renderY,mapValue - 1);
    };

    const clearBuffer = () => {
        const {context, buffer} = layerCache;
        context.clearRect(0,0,buffer.width,buffer.height);
    };

    const updateLayerCache = () => {
        const {tileSize} = layerCache; clearBuffer();
        for(let y = 0;y<rows;y++) {
            for(let x = 0;x<columns;x++) {
                renderTile(x,y,x*tileSize,y*tileSize);
            }
        }
    };

    this.refresh = () => {
        updateLightingLayer(); updateLayerCache();
    };
    this.render = (context,size) => {
        const {left,top,width,height} = grid.area;
        const scale = layerCache.tileSize;
        context.drawImage(
            layerCache.buffer,
            left * scale,top * scale,
            width * scale,height * scale,
            0,0,size.width,size.height
        );
    };
    Object.freeze(this);

    const tileSize = grid.baseTileSize * LIGHTING_TILE_SCALE;
    if(!layerCache.tryUpdateSize(tileSize)) return;
    lightCache.cache(layerCache.tileSize);
    updateLayerCache();
}

export default UVTCLighting;
