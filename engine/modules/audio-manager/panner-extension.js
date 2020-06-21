import audioContext from "../../internal/audio-context.js";
import RCData from "./rc-symbol.js";

const SOUND_HAS_NO_PANNING = () => {
    throw Error("Cannot use panning extensions because this sound was not readied for panning!");
};

const validatePanning = target => {
    const pannerNode = target[RCData].pannerNode;
    if(!pannerNode) SOUND_HAS_NO_PANNING();
    return pannerNode;
};

function InstallPannerExtension(target) {
    target.setPan = function(value) {
        const panner = validatePanning(this);
        panner.pan.value = value;
        return this;
    };
}

export default InstallPannerExtension;
