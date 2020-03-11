import GlyphTable from "./glyph-table.js";

const DEFAULT_SCALE = 4;
const DEFAULT_TEXT_SPACING = 1;
const DEFAULT_WORD_SPACING = 2;
const DEFAULT_ROW_SPACING = 1;
const DEFAULT_BOX_PADDING = 4;

const ELLIPSIS = "…";

const MapNewLinesAbleString = text => {
    return text.replace(/\n/g, " \n ").split(" ");
};
const MapStringsList = words => {
    for(let i = 0;i<words.length;i++) words[i] = {text:words[i],color:undefined};
    return words;
};
const FilterEllipsis = words => {
    for(let i = 0;i<words.length;i++) {
        words[i].text = words[i].text.replace(/\.\.\./gi,ELLIPSIS);
    }
};

function* TextGenerator(
    words,renderCharacter,width,scale,
    textSpacing,wordSpacing,rowSpacing,boxPadding
) {
    let y = boxPadding, x = boxPadding;
    const maxX = width - boxPadding;
    const rowHeight = scale * GlyphTable.height + rowSpacing;
    const getStatus = (value,next) => {
        return {current:value,next};
    };
    for(let i = 0;i<words.length;i++) {
        const {text,color} = words[i];
        if(text === "\n") {
            x = boxPadding; y += rowHeight; continue;
        }
        let wordSize = 0;
        for(const character of text) {
            wordSize += GlyphTable.getWidth(character) * scale + textSpacing;
        }
        if(x + wordSize > maxX && !(boxPadding + wordSize > maxX)) {
            y += rowHeight; x = boxPadding;
        }
        let xOffset = 0;
        for(let c = 0;c<text.length;c++) {
            const character = text[c];
            xOffset += renderCharacter(character,x + xOffset,y,color) + textSpacing;
            yield getStatus(character,text[c+1]||null);
        }
        if(i !== words.length - 1) yield getStatus(" ",words[i+1].text[0]||null);
        x += wordSize + wordSpacing;
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
    const renderCharacter = GlyphTable.getRenderer(bufferContext,scale);

    const generator = TextGenerator(
        text,renderCharacter,width,scale,textSpacing,wordSpacing,rowSpacing,boxPadding
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
