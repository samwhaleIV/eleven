//This is better than supplanting an audio context into the global context or replacing it
const audioContext = new AudioContext({
    latencyHint: "interactive"
});
export default audioContext;
