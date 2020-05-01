import ColorCodes from "./color-codes.js";
import Constants from "../../internal/constants.js";

const DEFAULT_SCALE = 4;
const DEFAULT_TEXT_SPACING = 1;
const DEFAULT_WORD_SPACING = 2;
const DEFAULT_ROW_SPACING = 1;
const DEFAULT_BOX_PADDING = 4;

const LONG_WORD_CLIP_JUSTIFICATION = 3 / 4;
const LONG_WORD_CLIP_CHARACTER = "-";

const ELLIPSIS = "…";
const COLOR_START = "%";
const INSTANT_FLAG = "&";

const MapNewLinesAbleString = text => text.replace(/\n/g, " \n ").split(" ");

const MapStringsList = words => {
    for(let i = 0;i<words.length;i++) {
        let text = words[i], color, backgroundColor, instant = false;
        if(text[0] === INSTANT_FLAG) {
            instant = true;
            text = text.substring(1);
        }
        if(text[0] === COLOR_START) {
            color = ColorCodes[text[1]];
            text = text.substring(2);
        }
        if(text[0] === COLOR_START) {
            backgroundColor = ColorCodes[text[1]];
            text = text.substring(2);
        }
        words[i] = {text,color,backgroundColor,instant};
    }
    return words;
};
const FilterEllipsis = words => {
    for(let i = 0;i<words.length;i++) {
        words[i].text = words[i].text.replace(/\.\.\./gi,ELLIPSIS);
    }
};

const IS_ALPHABETICAL = character => {
    return character.toLowerCase() !== character.toUpperCase();
};

function* TextGenerator(
    glyphTable,words,renderCharacter,width,scale,
    textSpacing,wordSpacing,rowSpacing,boxPadding
) {
    let y = boxPadding, x = boxPadding;
    const maxX = width - boxPadding;
    const rowHeight = scale * glyphTable.height + rowSpacing;
    const getStatus = (value,next) => {
        return {current:value,next};
    };

    const clipCharacter = LONG_WORD_CLIP_CHARACTER;

    const getWidth = character => glyphTable.getWidth(character) * scale + textSpacing;
    const hyphenWidth = getWidth(clipCharacter);

    const clipJustification = LONG_WORD_CLIP_JUSTIFICATION;

    const widthRange = maxX - boxPadding;

    for(let i = 0;i<words.length;i++) {
        const onLastWord = i === words.length - 1;
        const {text,color,backgroundColor,instant} = words[i];

        if(text === "\n") {
            x = boxPadding; y += rowHeight; continue;
        }
        let wordSize = 0;
        for(const character of text) {
            wordSize += getWidth(character);
        }
        let rowClip = boxPadding + wordSize > maxX;
        const wordClip = x + wordSize > maxX;

        if(x / widthRange > clipJustification) rowClip = false;

        if(wordClip && !rowClip) {
            y += rowHeight; x = boxPadding;
        }
        let xOffset = 0;
        for(let c = 0;c<text.length;c++) {
            const onLastLetter = c === text.length - 1;

            const character = text[c];
            const width = getWidth(character);
            if(wordClip) {
                const isAlphabetical = IS_ALPHABETICAL(character);
                let max = maxX; if(isAlphabetical) max -= hyphenWidth;
                if(x + xOffset + width > max) {
                    if(isAlphabetical) renderCharacter(clipCharacter,x + xOffset,y,color);
                    x = boxPadding;
                    xOffset = 0; y += rowHeight;
                }
            }

            renderCharacter(character,x + xOffset,y,color,backgroundColor?{
                color: backgroundColor,
                widthOffset: textSpacing, heightOffset: 2,
                xOffset: 0, yOffset: -1
            }:null);

            xOffset += width;
            const next = onLastWord && onLastLetter ? null : onLastLetter ? " " : text[c+1];
            if(!instant) yield getStatus(character,next);
        }
        if(!onLastWord) {
            const next = words[i+1].text[0];
            getStatus(" ",next);
        }
        x += xOffset + wordSpacing;
    }
}

function TextLayer({
    text,width,height,autoComplete,
    scale = DEFAULT_SCALE,
    textSpacing = DEFAULT_TEXT_SPACING,
    wordSpacing = DEFAULT_WORD_SPACING,
    rowSpacing = DEFAULT_ROW_SPACING,
    boxPadding = DEFAULT_BOX_PADDING
}) {
    const glyphTable = globalThis[Constants.EngineNamespace].GlyphTable;

    if(typeof text === "string") text = MapNewLinesAbleString(text);
    if(typeof text[0] === "string") text = MapStringsList(text);
    FilterEllipsis(text);

    textSpacing *= scale; wordSpacing *= scale;
    rowSpacing *= scale; boxPadding *= scale;

    const buffer = new OffscreenCanvas(width,height);
    Object.defineProperties(this,{
        width: {value:width,enumerable:true},
        height: {value:height,enumerable:true}
    });

    const bufferContext = buffer.getContext("2d",{alpha:true});
    bufferContext.imageSmoothingEnabled = false;
    const renderCharacter = glyphTable.getRenderer(bufferContext,scale);

    const generator = TextGenerator(
        glyphTable,text,renderCharacter,width,scale,
        textSpacing,wordSpacing,rowSpacing,boxPadding
    );

    const finish = () => {
        while(!generator.next().done);
    };

    this.next = generator.next.bind(generator);
    this.finish = finish;

    if(autoComplete) finish();

    this.render = (context,x,y) => context.drawImage(buffer,0,0,width,height,x,y,width,height);
}
export default TextLayer;
