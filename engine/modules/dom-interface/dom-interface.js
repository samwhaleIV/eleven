import Constants from "../../internal/constants.js";

const INTERFACE_CLASS = "interface";
const INTERFACE_CONTAINER_CLASS = "interface-container";

const DUMMY_FRAME = {render:()=>{}};

function MenuController() {
    this.show = null; this.close = null;
}

function DOMInterface() {
    const {CanvasManager} = globalThis[Constants.EngineNamespace];

    const layers = new Array();

    const layerContainer = document.createElement("div");
    layerContainer.className = INTERFACE_CONTAINER_CLASS;
    document.body.appendChild(layerContainer);

    const removeAllChildren = target => {
        let lastChild = target.lastChild;
        while(lastChild) {
            target.removeChild(lastChild);
            lastChild = target.lastChild;
        }
    };
    
    let activeLayerID = null, frameTargetOverride = null;

    const clearActiveLayer = () => {
        removeAllChildren(layerContainer);
        activeLayerID = null;
    };

    const setActiveLayer = (layer,ID) => {
        if(ID === activeLayerID) return;
        clearActiveLayer(); activeLayerID = ID;

        layer.classList.add(INTERFACE_CLASS);
        layerContainer.appendChild(layer);
    };

    const tryRefreshInput = frame => {
        if(frame && frame.refreshInput) frame.refreshInput();
    };

    const openDOM = () => {
        const {frame} = CanvasManager; if(!frame) return;
        const target = frame.getDeepest();
        frameTargetOverride = target;
        target.child = DUMMY_FRAME;
        tryRefreshInput(frame);
    };

    const closeDOM = () => {
        clearActiveLayer();
        if(!frameTargetOverride) return;
        frameTargetOverride.child = null;
        frameTargetOverride = null;
        tryRefreshInput(CanvasManager.frame);
    };

    const deleteLayer = deleteID => {
        for(let i = layers.length-1;i>=0;i--) {
            const {layer,ID} = layers[i];
            if(ID === deleteID) { layers.splice(i,1); return layer; }
        }
        return null;
    };

    const hasLayer = () => layers.length >= 1;

    const activateTopLayer = () => {
        const {layer,ID} = layers[layers.length-1];
        setActiveLayer(layer,ID);
    };

    const postLayerRemoval = () => {
        if(hasLayer()) {
            activateTopLayer();
        } else {
            closeDOM();
        }
    };

    const removeLayer = ID => {
        const removedLayer = deleteLayer(ID);
        postLayerRemoval();
        return removedLayer || null;
    };

    let IDGenerator = 1;
    const getID = () => {
        const ID = IDGenerator;
        IDGenerator++;
        return ID;
    };

    const addLayer = (layer,...parameters) => {
        let ID = null;
        if(typeof layer === "object") {
            ID = layer.ID; layer = layer.layer;
        } else {
            ID = getID();
        }
        layer = layer({ID,terminate:()=>removeLayer(ID)},...parameters);
        if(!hasLayer()) {
            openDOM();
        } else {
            deleteLayer(ID);
        }
        layers.push({layer,ID});
        setActiveLayer(layer,ID);
        return ID;
    };

    const dropLayer = () => {
        if(!hasLayer()) return;
        const droppedLayer = layers.pop();
        postLayerRemoval();
        return droppedLayer;
    };

    const hasID = layerID => {
        for(let i = 0;i<layers.length;i++) {
            if(layers[i].ID === layerID) return true;
        }
        return false;
    };

    const bringToFront = ID => {
        const layer = deleteLayer(ID);
        layers.push({layer,ID});
        activateTopLayer();
    };

    const getMenu = layer => {
        const menuID = getID();
        const menuController = new MenuController();
        menuController.show = (...parameters) => {
            if(hasID(menuID)) {
                bringToFront(menuID); return;
            }
            addLayer({layer, ID: menuID},...parameters);
        };
        menuController.close = () => void removeLayer(menuID);

        Object.defineProperty(menuController,"visible",{
            get: () => activeLayerID === menuID,
            enumerable: true
        });
        Object.freeze(menuController);
        return menuController;
    };

    this.removeLayer = removeLayer;
    this.addLayer = addLayer;
    this.hasLayer = hasLayer;
    this.dropLayer = dropLayer;
    this.hasID = hasID;
    this.getID = getID;
    this.getMenu = getMenu;

}

export default DOMInterface;
