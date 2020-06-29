import Constants from "../../internal/constants.js";
const INPUT_ROUTES = Constants.InputRoutes;

const INPUT_METHODS = [
    INPUT_ROUTES.keyDown,
    INPUT_ROUTES.keyUp,
    INPUT_ROUTES.input,
    INPUT_ROUTES.inputGamepad
];

const INTERFACE_CLASS = "interface";
const INTERFACE_CONTAINER_CLASS = "interface-container";
const REFRESH_INPUT = Constants.InputRoutes.refreshInput;

function MenuController() {
    this.show = null; this.close = null;
}

function ProxyFrame() {
    this.opaque = false;
    this.render = () => {};
    INPUT_METHODS.forEach(method => this[method] = null);
    Object.seal(this);
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

    const updateProxyFrame = proxyFrame => {
        if(!frameTargetOverride) return;
        frameTargetOverride.child = proxyFrame;
    };

    const setActiveLayer = (layer,ID,proxyFrame) => {
        if(ID === activeLayerID) return;
        clearActiveLayer(); activeLayerID = ID;

        updateProxyFrame(proxyFrame);
        layer.classList.add(INTERFACE_CLASS);
        layerContainer.appendChild(layer);
    };

    const tryRefreshInput = frame => {
        if(!frame) return;
        const refreshInput = frame[REFRESH_INPUT];
        if(refreshInput) refreshInput();
    };

    const openDOM = proxyFrame => {
        const {frame} = CanvasManager; if(!frame) return;
        const target = frame.getDeepest();
        frameTargetOverride = target;
        updateProxyFrame(proxyFrame);
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
            const layer = layers[i];
            if(layer.ID === deleteID) { layers.splice(i,1); return layer; }
        }
        return null;
    };

    const hasLayer = () => layers.length >= 1;

    const activateTopLayer = () => {
        const {layer,ID,proxyFrame} = layers[layers.length-1];
        setActiveLayer(layer,ID,proxyFrame);
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
        if(!removedLayer) return;
        postLayerRemoval();
        return removedLayer.layer || null;
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

        const proxyFrame = new ProxyFrame();
        layer = layer({
            ID,proxyFrame,terminate:()=>removeLayer(ID)
        },...parameters);

        if(!hasLayer()) {
            openDOM(proxyFrame);
        } else {
            deleteLayer(ID);
        }

        layers.push({layer,ID,proxyFrame});
        setActiveLayer(layer,ID,proxyFrame);
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
        layers.push(layer);
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
        menuController.close = () => {
            removeLayer(menuID);
        };

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
