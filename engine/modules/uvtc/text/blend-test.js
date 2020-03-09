import GlyphTable from "./glyph-table.js";

const BLEND_MODES = [
    "source-over", "source-in", "source-out",
    "source-atop", "destination-over", "destination-in",
    "destination-out", "destination-atop", "lighter",
    "copy", "xor", "multiply", "screen", "overlay",
    "darken", "lighten", "color-dodge", "color-burn",
    "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation",
    "color", "luminosity"
];

async function BlendTest() {
    const glpyhTable = new GlyphTable();
    await glpyhTable.load();

    const offscreenCanvas = new OffscreenCanvas(0,0);
    const context = offscreenCanvas.getContext("2d",{alpha:true});

    const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfeghijklmnopqrstuvwxyz";
    const scale = 4;

    const bufferWidth = 1000;
    const bufferHeight = scale * (glpyhTable.height + 1);

    offscreenCanvas.width = bufferWidth
    offscreenCanvas.height = BLEND_MODES.length * bufferHeight;

    const colors = [];
    const rByte = () => Math.floor(Math.random()*256);
    const rColor = () => `rgb(${rByte()},${rByte()},${rByte()})`;
    for(let x = 0;x<bufferWidth;x++) {
        colors.push(rColor());
    }

    const colorMode = 0;

    const getBuffer = mode => {
        
        const buffer = new OffscreenCanvas(bufferWidth,bufferHeight);
        const context = buffer.getContext("2d",{alpha:true});
        const renderCharacter = glpyhTable.getRenderer(context,4);

        
        for(let i = 0;i<colors.length;i++) {
            context.fillStyle = colors[i];
            context.fillRect(i,0,1,bufferHeight);
        }

        context.save();
        context.globalCompositeOperation = mode;
        context.imageSmoothingEnabled = false;

        let x = scale;
        for(let i = 0;i<string.length;i++) {
            x += renderCharacter(string[i],x,0,rColor()) + scale;
        }

        context.restore();
        
        return buffer;
    };

    for(let i = 0;i<BLEND_MODES.length;i++) {
        const mode = BLEND_MODES[0];
        const buffer = getBuffer(mode);

        context.drawImage(buffer,0,i*bufferHeight);
    }

    offscreenCanvas.convertToBlob({
        type: "image/png"
    }).then(function(blob) {
        window.open(URL.createObjectURL(blob));
    });
}
export default BlendTest;
