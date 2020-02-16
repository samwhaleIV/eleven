import engine from "../engine/eleven.js";

const CanvasManager = engine.CanvasManager;
const ResourceManager = engine.ResourceManager;
const AudioManager = engine.AudioManager;

function TestFrame(noRecursion=false) {

    const sound = "sound";
    const soundExtension = ".mp3";

    const song_full = "song_full";

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
        AudioManager.play(ResourceManager.getAudio(sound));
    };
    this.altClickDown = async () => {
        await AudioManager.playMusicLooping(
            ResourceManager.getAudio(song_full)
        ).waitForEnd();
        console.log("Song finished playing");
    };

    this.load = async () => {

        if(!noRecursion) {
            await this.setChild(function() {
                this.load = async () => {
                    await new Promise(resolve => {
                        setTimeout(resolve,100);
                    });
                    console.log("I just loaded after 100ms!");
                };
            });
            await this.setChild(TestFrame,true);
        }

        const shouldMerge = !ResourceManager.hasAudio(song_full);

        if(shouldMerge) {
            ResourceManager.queueAudio(song_intro,song_loop);
        }
    
        ResourceManager.queueManifest(`{
            "Audio": ["${sound}${soundExtension}"]
        }`);

        const {Audio} = await ResourceManager.loadWithDictionary();

        if(shouldMerge) {
            ResourceManager.setAudio(song_full,AudioManager.mergeBuffers(
                Audio[song_intro],Audio[song_loop]
            ));
            ResourceManager.removeAudio(song_intro,song_loop);
        }

        ResourceManager.setText("test_string","Ligma balls.");
        console.log(ResourceManager.getText("test_string"));

        ResourceManager.set("test_string_2","Ligma balls again.","Text");
        console.log(ResourceManager.getText("test_string_2"));
    };
    this.resize = context => {
        context.fillStyle = "green";
    };
    this.render = (context,size) => {
        if(this.child) {
            context.fillStyle = "green";
        }
        context.fillRect(0,0,size.width,size.height);
    };
}

CanvasManager.start({
    frame: TestFrame,
    markLoaded: true
});
