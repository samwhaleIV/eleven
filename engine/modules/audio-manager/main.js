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

    const radioFadeOut = (radio,duration) => {
        return new Promise(resolve => radio.fadeOut(duration,resolve));
    };
    this.fadeOutSounds = function(duration) {
        return radioFadeOut(soundRadio,duration);
    };
    this.fadeOutMusic = function(duration) {
        return radioFadeOut(musicRadio,duration);
    };

    this.stopAllSounds = function() {
        return soundRadio.stopAll();
    };
    this.stopMusic = function() {
        return musicRadio.stopAll();
    };
    this.play = function(buffer,isSound) {
        return (isSound ? this.playSound : this.playMusic)({buffer});
    };

    Object.freeze(this);
}
export default AudioManager;
