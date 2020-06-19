import Constants from "../../internal/constants.js";

const DEFAULT_LINE_SPACING = 1;
const DEFAULT_SCALE = 3;
const DEFAULT_LETTER_SPACING = 1;
const DEFAULT_WORD_SPACING = 2;
const DEFAULT_BACKGROUND_PADDING = 1;

const limitedPremutiply = (value,scale) => Math.max(1,value * scale);

function Line(glyphTable,text,letterSpacing,wordSpacing,scale) {
    text = text.split(" ");

    const unmult_letterSpacing = letterSpacing / scale;
    const unmult_wordSpacing = wordSpacing / scale;

    let width = 0;
    for(const word of text) {
        for(const character of word) {
            width += glyphTable.getWidth(character) + unmult_letterSpacing;
        }
        width = width - unmult_letterSpacing + unmult_wordSpacing;
    }
    width -= unmult_wordSpacing;

    width *= scale;

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

    letterSpacing = limitedPremutiply(letterSpacing,scale);
    wordSpacing = limitedPremutiply(wordSpacing,scale);
    lineSpacing = limitedPremutiply(lineSpacing,scale);

    const glyphTable = globalThis[Constants.EngineNamespace].GlyphTable;
    if(!lines && text) {
        lines = text.split("\n");
    }
    text = null;

    let width = 0;
    const lineCount = lines.length;

    for(let i = 0;i<lines.length;i++) {
        let line = new Line(
            glyphTable,lines[i],letterSpacing,wordSpacing,scale
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
        if(width % 2 !== 0) width++;

        const totalWidth = width + backgroundPadding * 2;
        const totalHeight = height + backgroundPadding * 2;

        let xOffset = -totalWidth / 2;
        let yOffset = -totalHeight / 2;

        const bufferXOffset = xOffset + backgroundPadding;
        const bufferYOffset = yOffset + backgroundPadding;

        this.height = totalHeight;
        this.halfHeight = this.height / 2;

        this.render = (context,x,y) => {
            if(backgroundColor) {
                context.fillStyle = backgroundColor;
                context.fillRect(
                    Math.floor(x+xOffset),Math.floor(y+yOffset),
                    totalWidth,totalHeight
                );
            }
            context.drawImage(
                buffer,Math.floor(x+bufferXOffset),Math.floor(y+bufferYOffset)
            );
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
        this.roundRenderPosition = true;
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
