import FontData from "./font-data.js";

const DEFAULT_COLOR = "black";

let table = null;
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
    table = glyphs;
}
LoadTable();

let bitmap = null;
function LoadBitmap() {
    return new Promise((resolve,reject) => {
        if(bitmap) resolve(bitmap);
        const image = new Image();
        bitmap = image;
        image.onload = () => {
            resolve(bitmap);
        };
        image.onerror = error => {
            reject(error);
        };
        image.src = FontData.data;
    });
}

function GlyphTable() {
    let bitmap = null, glyphHeight = null;
    this.load = async () => {
        bitmap = await LoadBitmap();
        glyphHeight = bitmap.height;
        return this;
    };

    Object.defineProperty(this,"height",{
        get: () => glyphHeight,
        enumerable: true
    });

    this.getWidth = character => {
        return table[character][1];
    };

    this.getRenderer = (context,scale=1) => {
        const buffer = new OffscreenCanvas(0,0);
        buffer.height = glyphHeight;
        
        const bufferContext = buffer.getContext("2d",{alpha:true});
        const renderHeight = glyphHeight * scale;

        let currentColor = DEFAULT_COLOR;

        return (character,x,y,color) => {
            if(color) currentColor = color;
            const [column, glpyhWidth] = table[character];
            const renderWidth = glpyhWidth * scale;

            buffer.width = glpyhWidth;

            bufferContext.globalCompositeOperation = "source-over";
            bufferContext.drawImage(
                bitmap,column,0,glpyhWidth,glyphHeight,0,0,glpyhWidth,glyphHeight
            );
            bufferContext.globalCompositeOperation = "source-in";
            bufferContext.fillStyle = currentColor;
            bufferContext.fillRect(0,0,glpyhWidth,glyphHeight);

            context.drawImage(
                buffer,
                0,0,glpyhWidth,glyphHeight,
                x,y,renderWidth,renderHeight
            );

            return renderWidth;
        };
    };
}

export default GlyphTable;
