//Should always be greater than zero for interoperating with zero values elsewhere
const START_ID_VALUE = 1;
const DEFAULT_PRIORITY = 0;

const CANNOT_MUTATE_DURING_CLEAR = () => {
    throw Error("Cannot mutate multi-layer during deletion");
};

function MultiLayer() {

    let IDCounter = START_ID_VALUE;

    const layers = new Object();
    const priorityTable = new Object();

    let layersList = null;
    let layerCount = 0;

    let mutatationDisabled = false;

    const validateMutation = () => {
        if(mutatationDisabled) CANNOT_MUTATE_DURING_CLEAR();
    };

    const prioritySort = (a,b) => {
        return priorityTable[a.ID] - priorityTable[b.ID];
    };

    const updateList = () => {
        layersList = Object.values(layers).sort(prioritySort);
        layerCount = layersList.length;
    };
    this.add = (layer,priority=DEFAULT_PRIORITY) => {
        validateMutation();
        const ID = IDCounter; IDCounter++;

        layers[ID] = {layer,ID};
        priorityTable[ID] = priority;

        updateList();
        return ID;
    };
    this.setPriority = (ID,priority=DEFAULT_PRIORITY) => {
        validateMutation();
        if(!(ID in layers)) return;
        if(priorityTable[ID] === priority) return;
        priorityTable[ID] = priority;
        updateList();
    };
    this.get = ID => {
        if(!(ID in layers)) return null;
        return layers[ID].layer;
    };

    const dropID = ID => {
        delete layers[ID];
        delete priorityTable[ID];
    };

    this.remove = ID => {
        validateMutation();
        if(!(ID in layers)) return;
        dropID(ID); updateList();
    };

    this.clear = handler => {
        validateMutation();
        mutatationDisabled = true;

        if(handler) {
            for(let i = layerCount-1;i>=0;i--) {
                const {layer,ID} = layersList[i];

                handler(layer,ID); dropID(ID);
            }
        } else {
            for(let i = layerCount-1;i>=0;i--) {
                dropID(layersList[i].ID);
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
