//Should always be greater than zero for interoperating with zero values elsewhere
const START_ID_VALUE = 1;
const DEFAULT_PRIORITY = 0;

const CANNOT_MUTATE_DURING_CLEAR = () => {
    throw Error("Cannot mutate multi-layer during deletion");
};

const LAYER_INDEX = 0, ID_INDEX = 1;

function MultiLayer() {

    let IDCounter = START_ID_VALUE;

    const layers = new Object();
    const priorityTable = new Object();

    let layersList = null;
    let layerCount = 0;
    this.layers = [];

    let mutatationDisabled = false;

    const validateMutation = () => {
        if(mutatationDisabled) CANNOT_MUTATE_DURING_CLEAR();
    };

    const prioritySort = (a,b) => {
        return priorityTable[a[ID_INDEX]] - priorityTable[b[ID_INDEX]];
    };

    const updateList = () => {
        layersList = Object.values(layers).sort(prioritySort);
        this.layers = layersList.map(layer => layer[LAYER_INDEX]);
        layerCount = layersList.length;
    };
    this.add = (layer,priority=DEFAULT_PRIORITY) => {
        validateMutation();
        const ID = IDCounter; IDCounter += 1;

        layers[ID] = [layer,ID];
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
        return layers[ID][LAYER_INDEX];
    };

    const dropWatcher = new DropWatcher(this);
    const dropID = ID => {
        delete layers[ID];
        delete priorityTable[ID];
        dropWatcher.fire(ID);
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
                const [layer,ID] = layersList[i];
                handler(layer,ID); dropID(ID);
            }
        } else {
            for(let i = layerCount-1;i>=0;i--) {
                dropID(layersList[i][ID_INDEX]);
            }
        }

        mutatationDisabled = false;
        updateList();
    };
    this.forEach = handler => {
        const list = layersList, size = layerCount;
        let i = 0;
        while(i < size) {
            const [layer,ID] = list[i]; handler(layer,ID);
            i++;
        }
    };
}

function DropWatcher(target) {
    const dropWatchers = new Object();
    let IDCounter = 0;

    target.addDropWatcher = handler => {
        const ID = IDCounter; IDCounter += 1;
        dropWatchers[ID] = handler;
        return ID;
    };

    target.removeDropWatcher = ID => {
        delete dropWatchers[ID];
    };

    const fireDropWatchers = ID => {
        Object.values(dropWatchers).forEach(handler => handler(ID));
    };

    this.fire = fireDropWatchers;
}

export default MultiLayer;
