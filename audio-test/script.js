import engine from "../engine/eleven.js";
Namespace.makeGlobal(engine);

const CanvasManager = engine.CanvasManager;
const ResourceManager = engine.ResourceManager;
const AudioManager = engine.AudioManager;

function TestFrame() {
    let testSong = "song.mp3";
    let testSound = "sound.mp3";

    const audioContext = new AudioContext();

    this.RAW_TEST = () => {

        const source = audioContext.createBufferSource();
        source.buffer = testSound;

        source.addEventListener("ended",()=>{console.log("Ended")});

        source.connect(audioContext.destination);

        source.start();
    };

    const hell = () => {
        setTimeout(()=>{
            AudioManager.play(testSound);
            hell();
        },100);
    }

    this.clickDown = () => {
        //this.RAW_TEST();return;
        const control = AudioManager.playSound({buffer:testSound});
        
    };
    this.altClickDown = async () => {
        await AudioManager.play(testSong,true).fadeOutAsync(1000);
        console.log("Fade out done");
    };

    this.load = async () => {
        [testSong,testSound] = await ResourceManager.queueAudio([testSong,testSound]).load();
        console.log("Test song:",testSong);
        console.log("Test sound:",testSound);
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
