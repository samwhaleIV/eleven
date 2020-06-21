import audioContext from "../../internal/audio-context.js";
import webAudioZero from "./web-audio-zero.js";

const msToS = ms => ms / 1000; //1000ms -> 1s

const GAIN_CHECK_RATE = 1000 / 60; //~60 times per seconds

const CHECK_ACCURACY = webAudioZero;

const isAboutEqual = (value,target,accuracy) => {
    return value >= target - accuracy && value <= target + accuracy;
};

const Fade = (gainNode,duration,callback,fadeIn) => {
    const gainControl = gainNode.gain;

    const [startValue,endValue] = fadeIn ?
    [0,gainControl.value] : [gainControl.value,0];

    gainControl.value = startValue;

    const endTime = msToS(duration) + audioContext.currentTime;
    gainControl.linearRampToValueAtTime(endValue,endTime);

    //Setting the gain control value is EXTREMELY unstable.. We ran out of better options.
    const interval = setInterval(()=>{
        if(isAboutEqual(gainControl.value,endValue,CHECK_ACCURACY)) {
            clearInterval(interval); callback();
        }
    },GAIN_CHECK_RATE);
};

const FadeIn = (gainNode,duration,callback) => {
    return Fade(gainNode,duration,callback,true);
};
const FadeOut = (gainNode,duration,callback) => {
    return Fade(gainNode,duration,callback,false);
};

export {FadeIn,FadeOut};
