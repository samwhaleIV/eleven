function Internal(canvasManager) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d",{
        alpha: false,
        desynchronized: true
    });
    this.canvas = canvas;
    this.context = context;
    this.installDOM = () => {
        document.body.appendChild(canvas);
    };
    canvasManager.markLoaded = () => {
        document.body.classList.add("loaded");
    };
    canvasManager.markLoading = () => {
        document.body.classList.add("unloaded");
    };
    Object.freeze(this);
}
export default Internal;
