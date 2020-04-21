import FontData from "./font-data.js";

const DEFAULT_COLOR = "black";
const SPACE_WIDTH = 3;

const PADDING_CHARACTER = "|";
const PADDING_WIDTH = 1;

function LoadTable() {
    const metadata = FontData.meta;
    const glyphs = new Object();
    let glpyhX = 0;
    for(let i = 0;i<metadata.length;i+=2) {
        const character = metadata[i];
        const size = Number(metadata[i+1]);
        glyphs[character] = [glpyhX,size];
        glpyhX += size;
    }
    glyphs[" "] = [-1,SPACE_WIDTH];
    glyphs[PADDING_CHARACTER] = [-1,PADDING_WIDTH];
    return glyphs;
}

function LoadBitmap() {
    const {width, height, blob} = JSON.parse(FontData.data);
    const canvas = new OffscreenCanvas(width,height);
    const context = canvas.getContext("2d",{alpha:true});

    const imageData = context.createImageData(width,height);
    const pixelData = imageData.data;

    const ALPHA_COMPONENT = 3;

    for(let i = 0;i<pixelData.length;i+=4) {
        pixelData[i + ALPHA_COMPONENT] = Number(blob[i / 4]) ? 255 : 0;
    }

    context.putImageData(imageData,0,0);
    return canvas.transferToImageBitmap();
}

function GlyphTable() {
    const table = LoadTable();
    const bitmap = LoadBitmap();
    const glyphHeight = bitmap.height;

    Object.defineProperty(this,"height",{
        get: () => glyphHeight,
        enumerable: true
    });
    this.getWidth = character => table[character][1];

    this.getRenderer = (context,scale,color) => {
        const buffer = new OffscreenCanvas(0,0);
        buffer.height = glyphHeight;
        
        const bufferContext = buffer.getContext("2d",{alpha:true});
        const renderHeight = glyphHeight * scale;

        let currentColor = color || DEFAULT_COLOR;

        const renderBackground = (background,x,y,renderWidth,renderHeight) => {
            const {
                color, xOffset,yOffset,widthOffset,heightOffset
            } = background;
            context.fillStyle = color;
            context.fillRect(
                x + scale * xOffset,
                y + scale * yOffset,
                renderWidth + widthOffset * scale,
                renderHeight + heightOffset * scale
            );
        };

        return (character,x,y,color,background) => {
            if(color) currentColor = color;
            const [column, glpyhWidth] = table[character];
            const renderWidth = glpyhWidth * scale;
            if(column < 0) {
                if(background) renderBackground(background,x,y,renderWidth,renderHeight);
                return renderWidth;
            }

            buffer.width = glpyhWidth;

            bufferContext.globalCompositeOperation = "source-over";
            bufferContext.drawImage(
                bitmap,column,0,glpyhWidth,glyphHeight,0,0,glpyhWidth,glyphHeight
            );
            bufferContext.globalCompositeOperation = "source-in";
            bufferContext.fillStyle = currentColor;
            bufferContext.fillRect(0,0,glpyhWidth,glyphHeight);

            if(background) renderBackground(background,x,y,renderWidth,renderHeight);

            context.drawImage(
                buffer,
                0,0,glpyhWidth,glyphHeight,
                x,y,renderWidth,renderHeight
            );

            return renderWidth;
        };
    };
}
export default new GlyphTable();
export {GlyphTable};
