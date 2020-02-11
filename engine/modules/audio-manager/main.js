import audioContext from "../../internal/audio-context.js";
import Constants from "../../internal/constants.js";
import InstallVolumeControls from "./volume-control.js";
import Radio from "./radio.js";
import InstallIntroHelper from "./intro-helper.js";

const DEFAULT_SOUND_VOLUME = Constants.DefaultSoundVolume;
const DEFAULT_MUSIC_VOLUME = Constants.DefaultMusicVolume;

function AudioManager() {

    InstallIntroHelper(this);

    const {soundRadio, musicRadio} = (()=>{
        const {soundNode, musicNode} = InstallVolumeControls({
            target: this,
            output: audioContext.destination,
            soundVolume: DEFAULT_SOUND_VOLUME,
            musicVolume: DEFAULT_MUSIC_VOLUME
        });
        const soundRadio = new Radio({
            targetNode: soundNode,
            singleSource: false
        });
        const musicRadio = new Radio({
            targetNode: musicNode,
            singleSource: true
        });
        return {soundRadio, musicRadio};
    })();

    this.playSound = function({
        buffer,volume,playbackRate,detune,loop=false
    }) {
        return soundRadio.play({
            buffer,loop,volume,playbackRate,detune
        });
    };
    this.playMusic = function({
        buffer,volume,playbackRate,detune,loop=false
    }) {
        return musicRadio.play({
            buffer,loop,volume,playbackRate,detune
        });
    };

    this.playSoundLooping = function({
        buffer,volume,playbackRate,detune
    }) {
        return soundRadio.play({
            buffer,loop:true,volume,playbackRate,detune
        });
    };
    this.playMusicLooping = function({
        buffer,loopStart,volume,playbackRate,detune
    }) {
        return musicRadio.play({
            buffer,loop:true,loopStart,volume,playbackRate,detune
        });
    };

    const radioFadeOutAsync = (radio,duration) => {
        return radio.fadeOutAsync(duration,resolve);
    };
    this.fadeOutSoundsAsync = function(duration) {
        return radioFadeOutAsync(soundRadio,duration);
    };
    this.fadeOutMusicAsync = function(duration) {
        return radioFadeOutAsync(musicRadio,duration);
    };

    const radioFadeOut = (radio,duration,callback,parameters) => {
        return radio.fadeOut(duration,resolve,callback,...parameters);
    };
    this.fadeOutSounds = function(duration,callback,...parameters) {
        return radioFadeOut(soundRadio,duration,callback,parameters);
    };
    this.fadeOutMusic = function(duration,callback,...parameters) {
        return radioFadeOut(musicRadio,duration,callback,parameters);
    };

    this.stopAllSounds = function() {
        return soundRadio.stopAll();
    };
    this.stopMusic = function() {
        return musicRadio.stopAll();
    };
    this.play = function(buffer,isMusic) {
        return (isMusic ? this.playMusic: this.playSound)({buffer});
    };
    this.playLooping = function(buffer,loopStart=0,isMusic=true) {
        return (isMusic ? this.playMusicLooping: this.playSoundLooping)({buffer,loopStart});
    };

    Object.freeze(this);
}
export default AudioManager;
