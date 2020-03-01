function MultiLayer() {
    let IDCounter = 0;
    const layers = new Object();
    let layersList = null;
    let layerCount = 0;
    const updateList = () => {
        layersList = Object.values(layers);
        layerCount = layersList.length;
    };
    this.add = layer => {
        const layerID = IDCounter;
        layers[layerID] = layer;
        updateList();
        IDCounter++;
        return layerID;
    };
    this.remove = ID => {
        if(!(ID in layers)) return;
        delete layers[ID];
        updateList();
    };
    this.clear = handler => {
        Object.entries(layers).forEach(([key,value]) => {
            handler(value);
            delete layers[key];
        });
        updateList();
    };
    this.forEach = handler => {
        for(let i = 0;i<layerCount;i++) {
            handler(layersList[i]);
        }
    };
}
export default MultiLayer;
