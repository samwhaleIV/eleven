import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const CanvasManager = engine.CanvasManager;
const ResourceManager = engine.ResourceManager;
const AudioManager = engine.AudioManager;

function TestFrame() {
    let testSong = "song.mp3";
    let testSound = "sound.mp3";

    const inv_intro = "inv_intro.ogg";
    const inv_loop = "inv_loop.ogg";

    let inv_full = null;

    const audioContext = new AudioContext();

    this.RAW_TEST = () => {
        const source = audioContext.createBufferSource();
        source.buffer = testSound;

        source.addEventListener("ended",()=>{console.log("Ended")});

        source.connect(audioContext.destination);

        source.start();
    };

    this.clickDown = () => {
        AudioManager.stopMusic();
    };
    this.altClickDown = async () => {
        await AudioManager.playMusicLooping(inv_full,true).waitForEnd();
        console.log("Song finished playing");
    };

    this.load = async () => {
        let intro, loop;
        [testSong,testSound,intro,loop] = await ResourceManager.queueAudio([testSong,testSound,inv_intro,inv_loop]).load();

        console.log("Test song:",testSong);
        console.log("Test sound:",testSound);

        inv_full = AudioManager.mergeAudioBuffers(intro,loop);
        ResourceManager.removeAudio(inv_intro);
        ResourceManager.removeAudio(inv_loop);
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
