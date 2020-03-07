//Should always be greater than zero for interoperating with zero values elsewhere
const START_ID_VALUE = 1;

const CANNOT_MUTATE_DURING_CLEAR = () => {
    throw Error("Cannot mutate multi-layer during deletion");
};

function MultiLayer() {
    let IDCounter = START_ID_VALUE;
    const layers = new Object();
    let layersList = null;
    let layerCount = 0;
    let mutatationDisabled = false;

    const validateMutation = () => {
        if(mutatationDisabled) CANNOT_MUTATE_DURING_CLEAR();
    };

    const updateList = () => {
        layersList = Object.values(layers);
        layerCount = layersList.length;
    };
    this.add = layer => {
        validateMutation();
        const ID = IDCounter;
        layers[ID] = {layer,ID};
        IDCounter++;
        updateList();
        return ID;
    };
    this.get = ID => {
        if(!(ID in layers)) return null;
        return layers[ID].layer;
    };
    this.remove = ID => {
        validateMutation();
        if(!(ID in layers)) return;
        delete layers[ID];
        updateList();
    };
    this.clear = handler => {
        validateMutation();
        mutatationDisabled = true;
        if(handler) {
            for(let i = layerCount-1;i>=0;i--) {
                const {layer,ID} = layersList[i];
                handler(layer,ID); delete layers[ID];
            }
        } else {
            for(let i = layerCount-1;i>=0;i--) {
                delete layers[layersList[i][0]];
            }
        }
        mutatationDisabled = false;
        updateList();
    };
    this.forEach = handler => {
        for(let i = 0;i<layerCount;i++) {
            const {layer,ID} = layersList[i];
            handler(layer,ID);
        }
    };
}
export default MultiLayer;
