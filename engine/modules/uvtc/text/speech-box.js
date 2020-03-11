const CHARACTER_DELAY = 1000 / 60;
const SPACE_DELAY = 10;
const HYPHEN_DELAY = 0;
const COMMA_DELAY = 400;
const PERIOD_DELAY = 600;
const NEW_LINE_DELAY = 0;
const ELLIPSIS_DELAY = 800;

const SINGLE_QUOTE_DELAY = 0;
const DOUBLE_QUOTE_DELAY = 0;

const ELLIPSIS = "…";

const DELAYS = Object.freeze({
    [null]: 0,
    ".": PERIOD_DELAY,
    "!": PERIOD_DELAY,
    "?": PERIOD_DELAY,
    ",": COMMA_DELAY,
    "-": HYPHEN_DELAY,
    "\n": NEW_LINE_DELAY,
    "\"": DOUBLE_QUOTE_DELAY,
    "'": SINGLE_QUOTE_DELAY,
    [ELLIPSIS]: ELLIPSIS_DELAY,
    " ": SPACE_DELAY,
});

const PUNCTUATION = Object.freeze([".","!","?",",",ELLIPSIS,"\"","'"].reduce((table,character)=>{
    table[character] = true; return table;
},new Object()));

const IS_PUNCTUATION = character => character in PUNCTUATION;

const asyncTimeout = duration => {
    return new Promise(resolve=>{
        const start = performance.now();
        const frameTimeBind = timestamp => {
            if(timestamp - start > duration) {
                resolve(); return;
            }
            requestAnimationFrame(frameTimeBind);
        };
        requestAnimationFrame(frameTimeBind);
    });
};
const getDuration = character => {
    return character in DELAYS ? DELAYS[character] : CHARACTER_DELAY;
};

const textTone = () => {
    Eleven.AudioManager.playTone(587.3295,0.3);
};

function SpeechBox(textLayer,playSound) {
    if(playSound === undefined) playSound = textTone;

    let running = false;
    let finished = false;

    const markFinished = () => {
        running = false; finished = true;
    };

    this.start = async () => {
        if(finished || running) return;
        running = true;
        let instance = 0;

        while(running) {
            const {done, value} = textLayer.next();
            const {current, next} = value;
            if(!done) {
                const duration = getDuration(current);
                if(playSound) {
                    if(instance % 2 == 0) playSound();
                    instance += 1;
                };

                if(duration && !(IS_PUNCTUATION(next) && IS_PUNCTUATION(current))) {
                    await asyncTimeout(duration);
                }
            } else {
                markFinished();
            }
        }
    };

    this.finish = () => {
        if(playSound) playSound(); textLayer.finish(); markFinished();
    };
}
export default SpeechBox;
