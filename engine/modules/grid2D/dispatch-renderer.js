import MultiLayer from "../../internal/multi-layer.js";
import Constants from "../../internal/constants.js";

const DISPATCHER_SET = ["Resize","Update","Background","Render","Finalize"];

function Dispatcher() {
    MultiLayer.call(this);
    this.target = (context,size,time) => {
        const layers = this.layers;
        for(let i = 0;i<layers.length;i++) {
            layers[i](context,size,time);
        }
    };
}

function DispatchRenderer() {
    const dispatchers = new Array();
    DISPATCHER_SET.forEach(dispatcherName => {
        const dispatcher = new Dispatcher();
        dispatchers.push(dispatcher);
        this[`add${dispatcherName}`] = dispatcher.add;
        this[`remove${dispatcherName}`] = dispatcher.remove;
        this[`clear${dispatcherName}`] = dispatcher.clear;
        this[dispatcherName.toLowerCase()] = dispatcher.target;
    });
    this.clear = () => {
        for(let i=0;i<dispatchers.length;i++) {
            dispatchers[i].clear();
        }
    }
    Object.freeze(this);
}

export default DispatchRenderer;
