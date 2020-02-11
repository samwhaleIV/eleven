import audioContext from "../../internal/audio-context.js";

function FadeIn(gainNode,duration,callback) {
    const gainControl = gainNode.gain;
    const endValue = gainControl.value;

    const now = audioContext.currentTime;
    gainControl.setValueAtTime(0,now);

    const endTime = now + duration / 1000;
    gainControl.linearRampToValueAtTime(endValue,endTime);

    if(callback) setTimeout(callback,duration);
}
function FadeOut(gainNode,duration,callback) {

    const endTime = audioContext.currentTime + duration / 1000;
    gainNode.gain.linearRampToValueAtTime(0,endTime);

    if(callback) setTimeout(callback,duration);
}

export default Object.freeze({
    FadeIn, FadeOut
});
export { FadeIn, FadeOut }
