import Constants from "../../../internal/constants.js";
const ENGINE_NAMESPACE = Constants.EngineNamespace;

const CHARACTER_DELAY = 30;
const SPACE_DELAY = 20;

const HYPHEN_DELAY = 0;

const COMMA_DELAY = 300;
const PERIOD_DELAY = 500;

const NEW_LINE_DELAY = 0;
const ELLIPSIS_DELAY = 600;

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
    ":": PERIOD_DELAY,
    "\"": DOUBLE_QUOTE_DELAY,
    "'": SINGLE_QUOTE_DELAY,
    [ELLIPSIS]: ELLIPSIS_DELAY,
    " ": SPACE_DELAY,
});

const PUNCTUATION = Object.freeze([".","!","?",",",ELLIPSIS,"\""].reduce((table,character)=>{
    table[character] = true; return table;
},new Object()));

const IS_PUNCTUATION = character => character in PUNCTUATION;

const getDuration = character => {
    return character in DELAYS ? DELAYS[character] : CHARACTER_DELAY;
};

const textTone = () => {
    const engineNamespace = globalThis[ENGINE_NAMESPACE];
    engineNamespace.AudioManager.playTone(587.3295,0.3);
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
            if(!done) {
                const {current, next} = value;

                const currentPunc = IS_PUNCTUATION(current);

                if(playSound) {
                    if(!currentPunc && instance % 2 === 0) {
                        playSound();
                    }
                };

                if(next !== null) {
                    const duration = getDuration(current);
                    if(duration && !(IS_PUNCTUATION(next) && currentPunc)) {
                        instance += 1;
                        await delay(duration);
                    }
                }

            } else {
                markFinished();
            }
        }
    };

    this.finish = () => {
        textLayer.finish(); markFinished();
    };
}
export default SpeechBox;
