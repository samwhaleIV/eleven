import Constants from "../../internal/constants.js";

const LOADED_CLASS = Constants.CSSLoadedClass;

const DESYNCHRONIZED_CANVAS = Constants.DesynchronizedCanvas;
const TRANSPARENT_CANVAS = Constants.TransparentCanvas;

const DEFAULT_TARGET = document.body;
const TARGET_NAME = "target";

const INVALID_PARENT_ELEMENT = newParent => {
    throw Error(`Invalid parent element '${newParent}'`);
};

function Internal(canvasManager,modules) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d",{
        alpha: TRANSPARENT_CANVAS,
        desynchronized: DESYNCHRONIZED_CANVAS
    });
    this.canvas = canvas;
    this.context = context;
    
    const loadMarkTarget = DEFAULT_TARGET;
    canvasManager.markLoaded = () => {
        loadMarkTarget.classList.add(LOADED_CLASS);
    };
    canvasManager.markLoading = () => {
        loadMarkTarget.classList.remove(LOADED_CLASS);
    };

    this.trySetDefaultTarget = () => {
        if(!canvasManager.target) {
            canvasManager.target = DEFAULT_TARGET;
        }
    };
    this.canvasInDOM = () => {
        return document.body.contains(canvas);
    };

    canvasManager.context = context;

    Object.defineProperty(canvasManager,TARGET_NAME,{
        enumerable: true,
        get: function() {
            return canvas.parentElement;
        },
        set: function(newParent) {
            if(!newParent) {
                INVALID_PARENT_ELEMENT(newParent);
            }
            if(canvas.parentElement) {
                canvas.parentElement.removeChild(canvas);
            }
            newParent.appendChild(canvas);
            modules.resize.setDeferred();
        }
    });
    Object.freeze(this);
}
export default Internal;
