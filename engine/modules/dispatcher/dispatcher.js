import MultiLayer from "../../internal/multi-layer.js";

function Dispatcher() {
    MultiLayer.call(this);
    this.target = (...data) => this.forEach(handler => handler(...data));
}
export default Dispatcher;
