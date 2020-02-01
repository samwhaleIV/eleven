import audioContext from "../../internal/audio-context.js";
import Constants from "../../internal/constants.js";
import InstallVolumeControls from "./volume-control.js";

const DEFAULT_SOUND_VOLUME = Constants.DefaultSoundVolume;
const DEFAULT_MUSIC_VOLUME = Constants.DefaultMusicVolume;

function AudioManager() {
    const {soundNode, musicNode} = InstallVolumeControls({
        target: this,
        soundVolume: DEFAULT_SOUND_VOLUME,
        musicVolume: DEFAULT_MUSIC_VOLUME
    });

    

    Object.freeze(this);
}
export default AudioManager;
