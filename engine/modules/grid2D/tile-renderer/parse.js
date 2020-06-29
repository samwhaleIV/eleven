import DecodeUVTCMap from "./uvtc-parse.js";

const CANNOT_PARSE_RENDER_INFO = renderInformation => {
    throw Error(`Invalid metadata for 'renderData' of length '${renderInformation.renderData}'`);
};
const DIMENSION_MISMATCH = (size,target) => {
    throw Error(`Expected dimension metadata size of '${target}', got '${size}'`);
};
const BAD_RENDER_DATA = () => {
    throw Error("Render data must be an array!");
};
const UNALIGNED_RENDER_DATA = (renderDataSize,layerSize) => {
    throw Error(`Render data of length '${renderDataSize}' is not multiple of layer size '${layerSize}'`);
};
const MISSING_MAP_UVTC = () => {
    throw Error("Cannot code UVTC map because map is not included");
}

function UVTCMapPrelude(data) {
    const mapData = data.map;
    if(!mapData) MISSING_MAP_UVTC();
    const decodedMapData = DecodeUVTCMap(mapData,data.fillEmpty)
    return ParseGrid2DMap(decodedMapData);
}
function ParseGrid2DMap(data={}) {
    if(data.uvtcDecoding) return UVTCMapPrelude(data);

    let width = 0;
    let height = 0;
    let renderData = null;

    let skipZero = data.skipZero;
    if(skipZero === undefined) {
        skipZero = false;
    } else {
        skipZero = Boolean(skipZero);
    }

    if(data.renderData !== undefined) {

        renderData = data.renderData;

        let {columns, rows, layerSize} = data;

        if(!Array.isArray(renderData)) {
            BAD_RENDER_DATA();
        }
    
        const hasColumnSpec = columns !== undefined;
        const hasRowSpec = rows !== undefined;

        const hasDimension = hasColumnSpec || hasRowSpec;
        const hasLayerSize = layerSize !== undefined;

        if(hasDimension && hasLayerSize) {
            if(!(hasColumnSpec && hasRowSpec)) {
                if(hasColumnSpec) {
                    columns = layerSize / rows;
                } else {
                    rows = layerSize / columns;
                }
            }
            const calculatedLayerSize = columns * rows;
            if(calculatedLayerSize !== layerSize) {
                DIMENSION_MISMATCH(calculatedLayerSize,layerSize);
            }
            if(renderData.length % layerSize !== 0) {
                UNALIGNED_RENDER_DATA(renderData.length);
            }

            width = columns;
            height = rows;
        } else {
            CANNOT_PARSE_RENDER_INFO(data);
        }
    } else if(data.width && data.height) {
        width = data.width;
        height = data.height;
        const layerCount = data.layerCount || 1;
        renderData = new Array(width * height * layerCount).fill(0);
    } else {
        renderData = new Array(0);
    }

    const layerSize = width * height;
    const layerCount = renderData.length / layerSize;

    let renderLayerCount = data.renderLayerCount;
    if(renderLayerCount === undefined) {
        renderLayerCount = layerCount;
    }

    return {
        renderData,
        columns: width,rows: height,
        layerCount,layerSize,skipZero,
        renderLayerCount
    };
}

export default ParseGrid2DMap;
