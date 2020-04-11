import GlyphTable from "./text/glyph-table.js";

const DEFAULT_LINE_SPACING = 1;
const DEFAULT_SCALE = 3;
const DEFAULT_LETTER_SPACING = 1;
const DEFAULT_WORD_SPACING = 2;
const DEFAULT_BACKGROUND_PADDING = 1;

function Line(text,letterSpacing,wordSpacing,scale) {

    text = text.split(" ");

    let width = 0;
    for(const word of text) {
        for(const character of word) {
            width += GlyphTable.getWidth(character) + letterSpacing;
        }
        width = width - letterSpacing + wordSpacing;
    }
    width -= wordSpacing;

    width *= scale;

    this.width = width;

    letterSpacing *= scale; wordSpacing *= scale;

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
    lines, x, y, color, world, target = null, text,
    lineSpacing = DEFAULT_LINE_SPACING,
    letterSpacing = DEFAULT_LETTER_SPACING,
    scale = DEFAULT_SCALE,
    backgroundColor = null,
    backgroundPadding = DEFAULT_BACKGROUND_PADDING,
    wordSpacing = DEFAULT_WORD_SPACING,
    absolutePositioning = false
}) {
    if(!lines && text) {
        lines = text.split("\n");
    }
    text = null;

    let width = 0;
    const lineCount = lines.length;

    for(let i = 0;i<lines.length;i++) {
        let line = new Line(lines[i],letterSpacing,wordSpacing,scale);
        lines[i] = line;
        if(line.width > width) {
            width = line.width;
        }
    }

    const lineHeight = (GlyphTable.height + lineSpacing) * scale;
    const height = lineHeight * lineCount - (lineSpacing * scale);

    const buffer = new OffscreenCanvas(width,height);
    const context = buffer.getContext("2d",{alpha:true});
    context.imageSmoothingEnabled = false;

    const renderer = GlyphTable.getRenderer(context,scale,color);

    for(let i = 0;i<lines.length;i++) {
        lines[i].render(width,0,lineHeight*i,renderer);
    }

    backgroundPadding *= scale;

    if(absolutePositioning) {
        let totalWidth = width + backgroundPadding * 2;
        let totalHeight = height + backgroundPadding * 2;

        if(totalWidth % 2 !== 0) totalWidth++;
        if(totalHeight % 2 !== 0) totalHeight++;

        const xOffset = -totalWidth / 2;
        const yOffset = -totalHeight / 2;

        const bufferXOffset = xOffset + backgroundPadding;
        const bufferYOffset = yOffset + backgroundPadding;

        this.height = totalHeight;
        this.halfHeight = this.height / 2;

        this.render = (context,x,y) => {
            if(backgroundColor) {
                context.fillStyle = backgroundColor;
                context.fillRect(
                    x+xOffset,y+yOffset,
                    totalWidth,totalHeight
                );
            }
            context.drawImage(buffer,x+bufferXOffset,y+bufferYOffset);
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
    
            const {tileSize} = world.grid;
    
            const worldWidth = renderWidth / tileSize;
            const worldHeight = renderHeight / tileSize;
    
            this.width = worldWidth;
            this.height = worldHeight;
    
            this.x = renderX - worldWidth / 2;
            this.y = renderY - worldHeight / 2;
        };
        this.render = (context,x,y,width,height) => {
            if(target) y = Math.ceil(y);
            if(backgroundColor) {
                context.fillStyle = backgroundColor;
                context.fillRect(x-renderXOffset,y-renderYOffset,width,height);
            }
            context.drawImage(buffer,x,y);
        };
    }

}
export default TextSprite;
