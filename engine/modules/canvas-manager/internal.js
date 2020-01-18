const INVALID_PARENT_ELEMENT = () => {
    throw Error("Invalid parent element");
};

function Internal(canvasManager,modules) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d",{
        alpha: false,
        desynchronized: true
    });
    this.canvas = canvas;
    this.context = context;

    const loadMarkTarget = document.body;
    canvasManager.markLoaded = () => {
        loadMarkTarget.classList.add("loaded");
    };
    canvasManager.markLoading = () => {
        loadMarkTarget.classList.remove("loaded");
    };

    Object.defineProperty(canvasManager,"target",{
        get: function() {
            return canvas.parentElement;
        },
        set: function(newParent) {
            if(!newParent) {
                INVALID_PARENT_ELEMENT();
            }
            if(canvas.parentElement) {
                canvas.parentElement.removeChild(canvas);
            }
            newParent.appendChild(canvas);
            modules.resize.tryUpdateSize();
        },
        configurable: false,
        enumerable: false
    });
    Object.freeze(this);
}
export default Internal;
