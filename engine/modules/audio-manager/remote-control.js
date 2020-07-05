import RCData from "./rc-symbol.js";
import {FadeIn, FadeOut} from "./fader.js";
import {WrapBind} from "../../internal/callback-wrap.js";
import InstallPannerExtension from "./panner-extension.js";
import audioContext from "../../internal/audio-context.js";

function RemoteControl(data) {
    const endHandlers = new Object();
    let handlerCounter = 0;
    data.addEndHandler = handler => {
        const ID = handlerCounter;
        endHandlers[ID] = handler;
        handlerCounter += 1;
        return ID;
    };
    data.removeEndHandler = ID => {
        delete endHandlers[ID];
    };
    data.sendEndHandlers = () => {
        Object.values(endHandlers).forEach(handler => {
            handler();
        });
    };
    Object.freeze(data);
    const {radio, cacheID} = data;

    Object.defineProperty(this,RCData,{value:data});

    const isStopped = () => {
        return !radio.smartCache.contains(cacheID);
    };

    let endCallback = null;
    Object.defineProperty(this,"onended",{
        get: () => {
            return endCallback;
        },
        set: value => {
            if(!value) value = null;
            endCallback = value;
        },
        enumerable: true
    });

    Object.defineProperty(this,"stopped",{
        get: isStopped,
        enumerable: true
    });

    Object.freeze(this);
}
RemoteControl.prototype.setVolume = function(volume) {
    const {gainNode} = this[RCData];
    gainNode.gain.setValueAtTime(volume,audioContext.currentTime);
    return this;
}
RemoteControl.prototype.fadeOut = function(duration,callback,...parameters) {
    const {gainNode, addEndHandler, removeEndHandler} = this[RCData];
    const wrapBind = WrapBind(callback,parameters);
    const handlerID = addEndHandler(wrapBind);
    FadeOut(gainNode,duration,()=>{
        if(this.stopped) return;
        removeEndHandler(handlerID);
        this.stop(); wrapBind();
    });
    return this;
}
RemoteControl.prototype.fadeIn = function(duration,callback,...parameters) {
    FadeIn(this[RCData].gainNode,duration,WrapBind(callback,parameters));
    return this;
}
RemoteControl.prototype.fadeOutAsync = function(duration) {
    return new Promise(resolve => {
        this.fadeOut(duration,resolve);
    });
}
RemoteControl.prototype.fadeInAsync = function(duration) {
    return new Promise(resolve => {
        this.fadeIn(duration,resolve);
    });
}
RemoteControl.prototype.stop = function() {
    const {radio, cacheID} = this[RCData]; radio.stop(cacheID);
    return this;
}
RemoteControl.prototype.waitForEnd = function() {
    return new Promise(resolve => {
        this[RCData].addEndHandler(resolve);
    });
}
RemoteControl.prototype.addEndHandler = function(handler) {
    this[RCData].addEndHandler(handler);
    return this;
}
InstallPannerExtension(RemoteControl.prototype);

export default RemoteControl;
