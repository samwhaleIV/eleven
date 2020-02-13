import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const CanvasManager = engine.CanvasManager;
const ResourceManager = engine.ResourceManager;
const AudioManager = engine.AudioManager;

function TestFrame() {

    const song_intro = "inv_intro";
    const song_loop = "inv_loop";

    this.RAW_TEST = (()=>{
        const audioContext = new AudioContext();
        return () => {
            const source = audioContext.createBufferSource();
            source.buffer = testSound;
            source.addEventListener("ended",()=>{console.log("Ended")});
            source.connect(audioContext.destination);
            source.start();
        };
    })();

    this.clickDown = () => {
        AudioManager.play(this.resources.Audio.sound);
    };
    this.altClickDown = async () => {
        await AudioManager.playMusicLooping({buffer:this.resources.Audio.song}).waitForEnd();
        console.log("Song finished playing");
    };

    const songConversion = () => {
        const audio = this.resources.Audio;

        //Attaches to the shadow cache
        audio.song_full = AudioManager.mergeAudioBuffers(
            audio[song_intro],
            audio[song_loop]
        );

        //Removes from the master cache
        this.resources.removeAudio(song_intro,song_loop);
    };

    this.load = async () => {
        this.resources = await ResourceManager.queueJSON(`{
            "Audio": [
                "song.mp3",
                "sound.mp3",
                "${song_intro}.ogg",
                "${song_loop}.ogg"
            ]
        }`).loadWithDictionary();

        //Detaches from the master cache, stays in shadow cache
        this.resources.lockAudio("song");

        //Removes from the master cache
        ResourceManager.removeAudio("song");

        console.log(ResourceManager);
        console.log(this.resources);

        songConversion();
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
