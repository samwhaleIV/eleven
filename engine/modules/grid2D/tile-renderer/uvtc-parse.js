const CIPHER_LOOKUP = Object.freeze((function(inverse=false){
    const o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    n=o.length,c=Math.pow(n,2),r={};for(let e=0;e<c;e++)
    {const c=o[Math.floor(e/n)],f=o[e%n];inverse?r[e]=c+f:r[c+f]=e}return r;
})());

function DecodeStringLayer(layer) {
    const layerData = [];
    for(let i = 0;i<layer.length;i+=2) {
        const characterSet = layer.substring(i,i+2);
        layerData.push(CIPHER_LOOKUP[characterSet]);
    }
    return layerData;
}

function DecodeTableLayer(data,layerSize) {
    const layer = new Array(layerSize); layer.fill(0);
    const entries = Object.entries(data);

    for(let i = 0;i<entries.length;i++) {
        let [value,indices] = entries[i];
        value = CIPHER_LOOKUP[value];
        if(typeof indices === "number") {
            layer[indices] = value;
        } else {
            for(let x = 0;x<indices.length;x++) {
                layer[indices[x]] = value;
            }
        }
    }
    return layer;
}

function DecodeStrideLayer(layer) {
    const decodedLayer = new Array();
    for(let i = 0;i<layer.length;i+=2) {
        const type = CIPHER_LOOKUP[layer[i]];
        const length = layer[i+1];
        for(let x = 0;x<length;x++) {
            decodedLayer.push(type);
        }
    }
    return decodedLayer;
}

function DecodeUVTCMap(map,fillEmpty) {

    if(typeof map === "string") map = JSON.parse(map);

    const {columns, rows} = map;

    const {
        background, foreground,
        superForeground, collision,
        interaction, lighting
    } = map;

    const layers = [
        background, foreground,
        superForeground, collision,
        interaction, lighting
    ];

    if(typeof fillEmpty === "boolean") {
        fillEmpty = new Array(layers.length).fill(fillEmpty);
    }

    const layerSize = columns * rows;
    const renderData = new Array();

    const emptyData = new Array(layerSize); emptyData.fill(0);

    layers.forEach((layer,index) => {
        let data = fillEmpty[index] ? emptyData : null;

        if(layer) {
            if(Array.isArray(layer)) {
                data = DecodeStrideLayer(layer);
            } else if(typeof layer === "object") {
                data = DecodeTableLayer(layer,layerSize);
            } else if(typeof layer === "string") {
                data = DecodeStringLayer(layer);
            }
        }

        if(data !== null) renderData.push(...data);
    });

    return {rows, columns, layerSize, renderData, renderLayerCount: 2, skipZero: true};
}

export default DecodeUVTCMap;
