import audioContext from "../../internal/audio-context.js";

const OSCILLATOR_VOLUME = 0.2;

function TonePlayer(target,soundNode) {
    let lastTone = null;
    const stopTone = function() {
        if(!lastTone) return;
        lastTone.stop(audioContext.currentTime); lastTone = null;
    };
    const playTone = function(frequency,duration,volume) {
        if(!target.canPlaySound()) return;

        if(isNaN(volume)) volume = 1;

        const oscillator = audioContext.createOscillator();
        oscillator.type = "square";
        const oscillatorGain = audioContext.createGain();
    
        oscillator.connect(oscillatorGain);
        oscillatorGain.connect(soundNode);
    
        const startTime = audioContext.currentTime;
        const endTime = startTime + duration;
    
        oscillatorGain.gain.setValueAtTime(OSCILLATOR_VOLUME * volume,startTime);
        oscillatorGain.gain.exponentialRampToValueAtTime(0.00000001,endTime);
        oscillator.frequency.setValueAtTime(frequency,startTime);
        oscillator.start(startTime);
        oscillator.stop(endTime);
        stopTone();
        lastTone = oscillator;
    };

    target.stopTone = stopTone;
    target.playTone = playTone;
}
export default TonePlayer;
