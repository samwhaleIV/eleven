import ElevenTest from "../../eleven-test.js";

ElevenTest.Add(async function(){
    const r = Eleven.ResourceManager;
    console.log("Resource manager:",r);
    r.queueJSON("test");
    r.queueBinary("test.bin");
    r.queueText("test");
    r.queueAudio("moo.mp3");
    r.queueImage("snow_cat.jpg");
    await r.load();

    let hasJson = r.hasJSON("test");
    let hasText = r.hasText("test");
    let hasBinary = r.hasBinary("test");
    let hasAudio = r.hasAudio("moo");
    let hasImage = r.hasImage("snow_cat");

    ElevenTest.Assert(hasJson && hasText && hasBinary && hasAudio && hasImage,"Missing resource(s)!");

    const json = r.getJSON("test");
    const text = r.getText("test");
    const binary = r.getBinary("test");
    const audio = r.getAudio("moo");
    const image = r.getImage("snow_cat");

    ElevenTest.Assert(json.message === "Hello, world!","Bad JSON");
    ElevenTest.Assert(text === "Hello, world!","Bad text");
    ElevenTest.Assert(binary.byteLength >= 100, "Bad binary");
    
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image,0,0,image.width,image.height);

    ElevenTest.Assert(audio.duration >= 15 && audio.length >= 500000,"Bad audio");

    r.removeJSON("test");
    r.removeText("test");
    r.removeBinary("test");
    r.removeAudio("moo");
    r.removeImage("snow_cat");

    hasJson = r.hasJSON("test");
    hasText = r.hasText("test");
    hasBinary = r.hasBinary("test");
    hasAudio = r.hasAudio("moo");
    hasImage = r.hasImage("snow_cat");

    ElevenTest.Assert(!hasJson && !hasText && !hasBinary && !hasAudio && !hasImage,"Resources should be removed!");

    const data = `{
        "Audio": ["moo.mp3"],
        "Image": ["snow_cat.jpg"],
        "Binary": ["test.bin"],
        "JSON": ["test.json"],
        "Text": ["test.txt"]
    }`;

    await r.queueManifest(data).load();
    await r.queueManifest(data).load(true);

    r.remove("test","JSON");
    r.remove("test","Text");
    r.remove("test","Binary");
    r.remove("moo","Audio");
    r.remove("snow_cat","Image");

    r.queue("test.bin","Binary");
    r.queue("test","Text");
    r.queue("test","JSON");
    r.queue("snow_cat.jpg","Image");
    r.queue("moo.mp3","Audio");

    const isNull = value => value === null;

    ElevenTest.Assert(
        isNull(r.get("test","Binary")) &&
        isNull(r.get("test","Text")) &&
        isNull(r.get("test","JSON")) &&
        isNull(r.get("snow_cat","Image")) &&
        isNull(r.get("moo","Audio")),
        "Resources are not null after removal"
    );

    ElevenTest.Assert(
        !r.has("test","Binary") &&
        !r.has("test","Text") &&
        !r.has("test","JSON") &&
        !r.has("snow_cat","Image") &&
        !r.has("moo","Audio"),
        "Resources are not declared missing after removal"
    );

    const dictionary = await r.loadWithDictionary(true);

    const dictionaryMatch = (invertBin) => {
        ElevenTest.Assert(dictionary.JSON.test.message === r.getJSON("test").message,"Mismatched JSON");
        ElevenTest.Assert(dictionary.Text.test === r.getText("test"),"Mismatched text");
        const bin1 = dictionary.Binary.test;
        const bin2 = r.getBinary("test");
        ElevenTest.Assert(bin1 === bin2,"Mismatched binary",invertBin);
        ElevenTest.Assert(dictionary.Image.snow_cat === r.getImage("snow_cat"),"Mismatched image",invertBin);
        ElevenTest.Assert(dictionary.Audio.moo === r.getAudio("moo"),"Mismatched audio",invertBin);
    };

    dictionaryMatch();

    r.set("test",binary,"Binary");
    r.set("test",text,"Text");
    r.set("test",`{"message":"${json.message}"}`,"JSON");
    r.set("snow_cat",image,"Image");
    r.set("moo",audio,"Audio");

    dictionaryMatch(true);

    r.setBinary("test",binary);
    r.setText("test",text);
    r.setJSON("test",`{"message":"${json.message}"}`);
    r.setImage("snow_cat",image);
    r.setAudio("moo",audio);

    dictionaryMatch(true);

},"modules/resource-manager.js");
