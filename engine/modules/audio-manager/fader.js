import audioContext from "../../internal/audio-context.js";

const msToS = ms => ms / 1000; //1000ms -> 1s

const GAIN_CHECK_RATE = 1000 / 60; //~60 times per seconds

const CHECK_ACCURACY = 0.01;

const MAX_REDUNDANCY_AMOUNT = 4;

/* https://stackoverflow.com/questions/40564529/web-audio-change-gain-value-before-oscillator-starts */

const isAboutEqual = (value,target,accuracy) => {
    return value >= target - accuracy && value <= target + accuracy;
};

const Fade = (gainNode,duration,callback,fadeIn) => {
    const gainControl = gainNode.gain;

    const [startValue,endValue] = fadeIn ?
    [0,gainControl.value] : [gainControl.value,0];

    if(audioContext.state !== "running" && callback) {
        gainControl.setValueAtTime(endValue,audioContext.currentTime);
        callback();
        return;
    }

    gainControl.setValueAtTime(startValue,audioContext.currentTime);
    const endTime = msToS(duration) + audioContext.currentTime;
    gainControl.linearRampToValueAtTime(endValue,endTime);

    let lastValue = gainControl.value, repeatAmount = 0;

    //Setting the gain control value is EXTREMELY unstable.. We ran out of better options.
    const interval = setInterval(()=>{
        const newValue = gainControl.value;
        if(newValue === lastValue) {
            repeatAmount += 1;
            if(repeatAmount === MAX_REDUNDANCY_AMOUNT) {
                clearInterval(interval); callback();
                return;
            }
        } else {
            repeatAmount = 0;
        }
        lastValue = newValue;
        if(isAboutEqual(newValue,endValue,CHECK_ACCURACY)) {
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
