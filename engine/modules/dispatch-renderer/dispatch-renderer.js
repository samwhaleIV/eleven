import MultiLayer from "../../internal/multi-layer.js";

const DISPATCHER_SET = ["Resize","Update","Background","Render","Finalize"];

function Dispatcher() {
    MultiLayer.call(this);
    this.target = (...data) => this.forEach(handler => handler(...data));
}

function DispatchRenderer() {
    DISPATCHER_SET.forEach(dispatcherName => {
        const dispatcher = new Dispatcher();
        this[`add${dispatcherName}`] = dispatcher.add;
        this[`remove${dispatcherName}`] = dispatcher.remove;
        this[`clear${dispatcherName}`] = dispatcher.clear;
        this[dispatcherName.toLowerCase()] = dispatcher.target;
    });
    Object.freeze(this);
}

export default DispatchRenderer;
