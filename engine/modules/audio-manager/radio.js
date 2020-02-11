import audioContext from "../../internal/audio-context.js";
import SmartCache from "./smart-cache.js";
import {FadeIn, FadeOut} from "./fader.js";

import CallbackWrap from "../../internal/callback-wrap.js";
const {Wrap, WrapBind} = CallbackWrap;

const RCData = Symbol("RCData");

const DEFAULT_VOLUME = 1;
const DEFAULT_PLAYBACK_RATE = 1;
const DEFAULT_LOOP_START = 0;
const DEFAULT_DETUNE = 0;

const INVALID_TARGET_NODE = node => {
    throw Error(`Target node '${node}' of type '${typeof node}' is not a valid radio target`);
};

const getGainNode = volume => {
    const node = audioContext.createGain();
    const time = audioContext.currentTime;
    node.gain.setValueAtTime(volume,time);
    return node;
};

const getSourceNode = data => {
    const sourceNode = audioContext.createBufferSource();
    Object.assign(sourceNode,data);
    return sourceNode;
};

function RemoteControl(data) {
    const {radio, cacheID} = data;
    this[RCData] = data;

    const isStopped = () => {
        return !radio.smartCache.contains(cacheID);
    };
    this.stop = () => {
        return radio.stop(cacheID);
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

function Radio({
    targetNode = null,
    singleSource = false
}) {
    (masterNode=>{
        if(!masterNode) {
            INVALID_TARGET_NODE(masterNode);
        }
        const proxyNode = audioContext.createGain();
        const now = audioContext.currentTime;
        proxyNode.gain.setValueAtTime(DEFAULT_VOLUME,now);
        proxyNode.connect(masterNode);
        targetNode = proxyNode;
    })(targetNode);

    const smartCache = new SmartCache();

    this.targetNode = targetNode;
    this.singleSource = singleSource;
    this.smartCache = smartCache;

    if(!singleSource) {
        this.stopAll = smartCache.clear;
        this.stop = remoteControl => {
            const data = remoteControl[RCData];
            const cacheID = data.cacheID;
            return smartCache.release(cacheID);
        };
    } else {
        this.stopAll = smartCache.clear;
        this.stop = smartCache.clear;
    }
    Object.freeze(this);
}

Radio.prototype.fadeOut = function(duration,callback,...parameters) {
    FadeOut(this.targetNode,duration,()=>{
        radio.stopAll();
        const now = audioContext.currentTime;
        this.targetNode.setValueAtTime(DEFAULT_VOLUME,now);
        Wrap(callback,parameters);
    });
}
Radio.prototype.fadeIn = function(duration,callback,...parameters) {
    FadeIn(this.targetNode,duration,WrapBind(callback,parameters));
}
RemoteControl.prototype.fadeOut = function(duration,callback,...parameters) {
    const {radio, gainNode, cacheID} = this[RCData];
    FadeOut(gainNode,duration,()=>{
        radio.stop(cacheID);Wrap(callback,parameters);
    });
    return this;
}
RemoteControl.prototype.fadeIn = function(duration,callback,...parameters) {
    FadeIn(this[RCData].gainNode,duration,WrapBind(callback,parameters));
    return this;
}

const radioDisconnect = ({
    sourceNode,gainNode,destination
}) => {
    sourceNode.disconnect(gainNode);
    gainNode.disconnect(destination);
};
const basicTermination = radioDisconnect;
const loopTermination = data => {
    data.sourceNode.stop();
    radioDisconnect(data);
};
const getRadioTerminator = data => {
    if(data.loop) {
        return loopTermination(data);
    } else {
        return basicTermination(data);
    }
};

Radio.prototype.play = function({
    buffer = null,
    loop = false,
    loopStart = DEFAULT_LOOP_START,
    volume = DEFAULT_VOLUME,
    playbackRate = DEFAULT_PLAYBACK_RATE,
    detune = DEFAULT_DETUNE,
    callback = null
}){
    if(!callback) callback = null;
    if(this.singleSource) this.smartCache.clear();

    const destination = this.targetNode;
    const gainNode = getGainNode(volume);
    gainNode.connect(destination);

    const sourceNode = getSourceNode({
        buffer,loop,loopStart,playbackRate,detune
    });

    sourceNode.connect(gainNode);

    let cacheID = null, remoteControl = null;

    if(!loop) sourceNode.onended = () => {
        const didRelease = this.smartCache.release(cacheID);
        if(!didRelease) return;

        if(callback !== null) callback;
        const remoteCallback = remoteControl.onended;
        if(remoteCallback !== null) remoteCallback();
    };

    const termination = getRadioTerminator({
        loop,sourceNode,gainNode,destination
    });

    cacheID = this.smartCache.add(termination);

    sourceNode.play();
    remoteControl = RemoteControl(Object.freeze({
        radio:this,sourceNode,gainNode,cacheID
    }));

    return remoteControl;
}

Object.freeze(Radio.prototype); //Because you shouldn't be fucking with this ad hoc
Object.freeze(RemoteControl.prototype); //Note: Probably don't fuck with this one too

export default Radio;
