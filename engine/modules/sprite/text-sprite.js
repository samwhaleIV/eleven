import Constants from "../../internal/constants.js";
import LimitedPremultiply from "../text/limited-premultiply.js";

const DEFAULT_LINE_SPACING = 1;
const DEFAULT_SCALE = 3;
const DEFAULT_LETTER_SPACING = 1;
const DEFAULT_WORD_SPACING = 2;
const DEFAULT_BACKGROUND_PADDING = 1;

function Line(
    glyphTable,text,
    letterSpacing,
    wordSpacing,
    letterSpacingBase,
    wordSpacingBase,
    scale
) {
    text = text.split(" ");

    let width = 0;
    for(const word of text) {
        for(const character of word) {
            width += glyphTable.getWidth(character) + letterSpacingBase;
        }
        width = width - letterSpacingBase + wordSpacingBase;
    }
    width = (width - wordSpacingBase) * scale;

    this.width = width;

    this.render = (alignmentWidth,renderX,rowY,renderer) => {
        renderX += alignmentWidth / 2 - width / 2;
        renderX = Math.floor(renderX);
        for(const word of text) {
            for(const character of word) {
                renderX += renderer(character,renderX,rowY) + letterSpacing;
            }
            renderX = renderX - letterSpacing + wordSpacing;
        }
    };

    Object.freeze(this);
}

function TextSprite({
    lines, x, y, color, grid, target = null, text,
    lineSpacing = DEFAULT_LINE_SPACING,
    letterSpacing = DEFAULT_LETTER_SPACING,
    scale = DEFAULT_SCALE,
    backgroundColor = null,
    backgroundPadding = DEFAULT_BACKGROUND_PADDING,
    wordSpacing = DEFAULT_WORD_SPACING,
    absolutePositioning = false
}) {
    scale = Math.max(1,scale);

    letterSpacing = LimitedPremultiply(letterSpacing,scale);
    wordSpacing = LimitedPremultiply(wordSpacing,scale);
    lineSpacing = LimitedPremultiply(lineSpacing,scale);

    const letterSpacingBase = letterSpacing / scale;
    const wordSpacingBase = wordSpacing / scale;

    const glyphTable = globalThis[Constants.EngineNamespace].GlyphTable;
    if(!lines && text) lines = text.split("\n");
    text = null;

    let width = 0;
    const lineCount = lines.length;

    for(let i = 0;i<lines.length;i++) {
        let line = new Line(
            glyphTable,lines[i],letterSpacing,wordSpacing,
            letterSpacingBase,wordSpacingBase,scale
        );
        lines[i] = line;
        if(line.width > width) {
            width = line.width;
        }
    }

    backgroundPadding = Math.max(1,backgroundPadding * scale);

    const lineHeight = glyphTable.height * scale + lineSpacing;
    const height = lineHeight * lineCount - lineSpacing;

    const buffer = new OffscreenCanvas(width,height);
    const context = buffer.getContext("2d",{alpha:true});
    context.imageSmoothingEnabled = false;

    const renderer = glyphTable.getRenderer(context,scale,color);

    for(let i = 0;i<lines.length;i++) {
        lines[i].render(width,0,lineHeight*i,renderer);
    }

    if(absolutePositioning) {
        if(width % 2 !== 0) width += 1;

        const doubleBackgroundPadding = backgroundPadding * 2;

        const totalWidth = width + doubleBackgroundPadding;
        const totalHeight = height + doubleBackgroundPadding;

        const xOffset = -totalWidth / 2, yOffset = -totalHeight / 2;

        this.height = totalHeight;
        this.halfHeight = this.height / 2;

        const renderBackground = (context,x,y) => {
            context.fillStyle = backgroundColor;
            context.fillRect(x,y,totalWidth,totalHeight);
        };

        this.render = (context,x,y) => {
            x = Math.floor(x + xOffset), y = Math.floor(y + yOffset);
            if(backgroundColor) renderBackground(context,x,y);
            context.drawImage(buffer,x+backgroundPadding,y+backgroundPadding);
        };
    } else {
        Object.defineProperty(this,"target",{
            get: () => target,
            set: value => {
                if(!value) value = null;
                return target = value;
            },
            enumerable: true
        });

        if(!x) x = 0; if(!y) y = 0;

        this.width = 0; this.height = 0;
        this.x = x; this.y = y;

        let renderWidth = width, renderHeight = height;
        let renderXOffset = 0, renderYOffset = 0;
    
        if(renderWidth % 2 !== 0) renderWidth++;
        if(renderHeight % 2 !== 0) renderHeight++;
    
        if(backgroundColor) {
            const newLength = backgroundPadding * 2;
    
            renderWidth += newLength;
            renderHeight += newLength;
    
            renderXOffset = backgroundPadding;
            renderYOffset = backgroundPadding;
        }

        this.update = () => {

            let renderX = x, renderY = y;
    
            if(target) {
                let followX = target.x, followY = target.y;
                if(target.xOffset) followX += target.xOffset;
                if(target.yOffset) followY += target.yOffset;
    
                renderX += followX + target.width / 2;
                renderY += followY + target.height / 2;
            }
    
            const {tileSize} = grid;
    
            const worldWidth = renderWidth / tileSize;
            const worldHeight = renderHeight / tileSize;
    
            this.width = worldWidth;
            this.height = worldHeight;
    
            this.x = renderX - worldWidth / 2;
            this.y = renderY - worldHeight / 2;
        };
        this.roundRenderLocation = true;
        this.render = (context,x,y,width,height) => {
            if(backgroundColor) {
                context.fillStyle = backgroundColor;
                context.fillRect(x-renderXOffset,y-renderYOffset,width,height);
            }
            context.drawImage(buffer,x,y);
        };
    }

}
export default TextSprite;
