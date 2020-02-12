import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const CanvasManager = engine.CanvasManager;
const ResourceManager = engine.ResourceManager;
const AudioManager = engine.AudioManager;

function TestFrame() {

    const audioContext = new AudioContext();

    this.RAW_TEST = () => {
        const source = audioContext.createBufferSource();
        source.buffer = testSound;
        source.addEventListener("ended",()=>{console.log("Ended")});
        source.connect(audioContext.destination);
        source.start();
    };

    this.clickDown = () => {
        AudioManager.play(this.resources.Audio.sound);
    };
    this.altClickDown = async () => {
        await AudioManager.playMusicLooping(this.resources.Audio.song_full).waitForEnd();
        console.log("Song finished playing");
    };

    this.resources = null;
    this.load = async () => {
        const song_intro = "inv_intro";
        const song_loop = "inv_loop";
        this.resources = await ResourceManager.queueJSON(`{
            "Audio": [
                "song.mp3",
                "sound.mp3",
                "${song_intro}.ogg",
                "${song_loop}.ogg"
            ]
        }`).loadWithDictionary();
        const audio = this.resources.Audio;
        audio.song_full = AudioManager.mergeAudioBuffers(
            audio[song_intro],
            audio[song_loop]
        );
        this.resources.removeAudio(song_intro,song_loop);
    };
    this.resize = context => {
        context.fillStyle = "green";
    }; this.render = (context,size) => {
        context.fillRect(0,0,size.width,size.height);
    }
}

CanvasManager.start({
    frame: TestFrame,
    markLoaded: true
});
