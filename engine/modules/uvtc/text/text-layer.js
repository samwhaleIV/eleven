import GlyphTable from "./glyph-table.js";

//Todo: Add character level text hiding

const DEFAULT_TEXT_SPACING = 1;
const DEFAULT_WORD_SPACING = 1;
const DEFAULT_ROW_SPACING = 1;
const DEFAULT_BOX_PADDING = 2;

function MapStringsList(words) {
    for(let i = 0;i<words.length;i++) words[i] = {text:words[i],color:undefined};
    return words;
}

function TextLayer(words,width,height,scale,textSpacing,wordSpacing,rowSpacing,boxPadding) {
    if(typeof words === "string") words = words.split(" ");
    if(typeof words[0] === "string") words = MapStringsList(words);

    if(!textSpacing) textSpacing = DEFAULT_TEXT_SPACING;
    if(!wordSpacing) wordSpacing = DEFAULT_WORD_SPACING;
    if(!rowSpacing) rowSpacing = DEFAULT_ROW_SPACING;
    if(!boxPadding) boxPadding = DEFAULT_BOX_PADDING;

    textSpacing *= scale; wordSpacing *= scale;
    rowSpacing *= scale; boxPadding *= scale;

    const buffer = new OffscreenCanvas(width,height);
    Object.defineProperties(this,{
        width: {value:width,enumerable:true},
        height: {value:height,enumerable:true}
    });

    (new GlyphTable()).load().then(glyphTable => {
        const bufferContext = buffer.getContext("2d",{alpha:true});
        bufferContext.imageSmoothingEnabled = false;
        const renderCharacter = glyphTable.getRenderer(bufferContext,scale);

        let y = boxPadding, x = boxPadding;
        const maxX = width - boxPadding;
        const rowHeight = scale * glyphTable.height + rowSpacing;

        for(const {text,color} of words) {
            if(text === "\n") {
                x = boxPadding; y += rowHeight; continue;
            }
            let wordSize = 0;
            for(const character of text) {
                wordSize += glyphTable.getWidth(character) * scale + textSpacing;
            }
            if(x + wordSize > maxX) {
                y += rowHeight; x = boxPadding;
            }
            let xOffset = 0;
            for(const character of text) {
                xOffset += renderCharacter(character,x + xOffset,y,color) + textSpacing;
            }
            x += wordSize + wordSpacing;
        }
    });

    this.render = (context,x,y) => context.drawImage(buffer,0,0,width,height,x,y,width,height);
}
export default TextLayer;
