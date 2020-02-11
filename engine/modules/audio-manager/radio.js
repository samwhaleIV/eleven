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
const MISSING_AUDIO_BUFFER = () => {
    throw Error("Missing audio buffer, radio cannot play");
};

const getGainNode = volume => {
    const node = audioContext.createGain();
    const now = audioContext.currentTime;
    node.gain.setValueAtTime(volume,now);
    return node;
};

const getSourceNode = data => {
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = data.buffer;
    sourceNode.loop = data.loop;
    sourceNode.loopStart = data.loopStart;
    const now = audioContext.currentTime;
    sourceNode.detune.setValueAtTime(data.detune,now);
    sourceNode.playbackRate.setValueAtTime(data.playbackRate,now);
    return sourceNode;
};

function RemoteControl(data) {
    const {radio, cacheID} = data;
    this[RCData] = data;

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

function Radio({
    targetNode = null,
    singleSource = false
}) {
    (masterNode=>{
        if(!masterNode) {
            INVALID_TARGET_NODE(masterNode);
        }
        const proxyNode = audioContext.createGain();
        proxyNode.connect(masterNode);
        targetNode = proxyNode;
    })(targetNode);

    const smartCache = new SmartCache();

    this.targetNode = targetNode;
    this.singleSource = singleSource;
    this.smartCache = smartCache;

    if(!singleSource) {
        this.stopAll = smartCache.clear;
        this.stop = smartCache.release;
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
    FadeOut(this[RCData].gainNode,duration,()=>{
        if(this.stopped) return;
        this.stop();Wrap(callback,parameters)
    });
    return this;
}
RemoteControl.prototype.fadeIn = function(duration,callback,...parameters) {
    FadeIn(this[RCData].gainNode,duration,WrapBind(callback,parameters));
    return this;
}
RemoteControl.prototype.stop = function() {
    const {radio, cacheID} = this[RCData]; radio.stop(cacheID);
    return this;
}

Radio.prototype.play = function({
    buffer,loop,callback,
    loopStart = DEFAULT_LOOP_START,
    volume = DEFAULT_VOLUME,
    playbackRate = DEFAULT_PLAYBACK_RATE,
    detune = DEFAULT_DETUNE,
}){
    loop = Boolean(loop);
    if(!buffer) MISSING_AUDIO_BUFFER();
    if(!callback) callback = null;
    if(this.singleSource) this.smartCache.clear();

    const destination = this.targetNode;
    const gainNode = getGainNode(volume);
    gainNode.connect(destination);

    const sourceNode = getSourceNode({
        buffer,loop,loopStart,playbackRate,detune
    });

    let cacheID, remoteControl;

    sourceNode.onended = () => {
        this.smartCache.release(cacheID);
    };

    sourceNode.connect(gainNode);

    cacheID = this.smartCache.add(()=>{
        sourceNode.stop();
        gainNode.disconnect(destination);
        if(callback !== null) callback;
        const remoteCallback = remoteControl.onended;
        if(remoteCallback !== null) remoteCallback();
    });
    remoteControl = new RemoteControl(Object.freeze({
        radio:this,sourceNode,gainNode,cacheID
    }));

    sourceNode.start(audioContext.currentTime);

    return remoteControl;
}

Object.freeze(Radio.prototype); //Because you shouldn't be fucking with this ad hoc
Object.freeze(RemoteControl.prototype); //Note: Probably don't fuck with this one either

export default Radio;
