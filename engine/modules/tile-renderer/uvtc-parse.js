const BACKGROUND_COLOR = "black";

const CIPHER_LOOKUP = Object.freeze((function(inverse=false){
    const o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    n=o.length,c=Math.pow(n,2),r={};for(let e=0;e<c;e++)
    {const c=o[Math.floor(e/n)],f=o[e%n];inverse?r[e]=c+f:r[c+f]=e}return r;
})());

function DecodeMapLayer(layer) {
    if(typeof layer !== "string") return layer;
    const layerData = [];
    for(let i = 0;i<layer.length;i+=2) {
        const characterSet = layer.substring(i,i+2);
        layerData.push(CIPHER_LOOKUP[characterSet]);
    }
    return layerData;
}

function DecodeUVTCMap(map) {
    const {columns, rows, background, foreground, collision} = map;
    const layerSize = columns * rows;
    const renderData = new Array();

    if(background) renderData.push(...DecodeMapLayer(background));
    if(foreground) renderData.push(...DecodeMapLayer(foreground));
    if(collision) renderData.push(...DecodeMapLayer(collision));

    const backgroundColor = BACKGROUND_COLOR;

    return {rows, columns, layerSize, renderData, backgroundColor, renderLayerCount: 2, skipZero: true};
}

export default DecodeUVTCMap;
