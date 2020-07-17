import LightCache from "../world2D/lighting/light-cache.js";

const LIGHT_RESOLUTION = 128;
let lightCache = null;

function LightSprite(x,y) {
    if(!lightCache) {
        lightCache = new LightCache();
        lightCache.cache(LIGHT_RESOLUTION);
    }
    this.x = x, this.y = y;
    this.width = 2, this.height = 2;
    this.xOffset = -0.5, this.yOffset = -0.5;
    this.collides = false;

    let gradientID = null;
    const buffer = new OffscreenCanvas(
        LIGHT_RESOLUTION*2,LIGHT_RESOLUTION*2
    );
    const context = buffer.getContext("2d",{alpha:true});

    const updateBuffer = () => {
        context.clearRect(0,0,buffer.width,buffer.height);
        const quarterSize = buffer.width / 4;
        lightCache.render(
            context,quarterSize,quarterSize,gradientID
        );
    };

    Object.defineProperty(this,"gradientID",{
        get: () => gradientID,
        set: value => {
            gradientID = value;
            updateBuffer();
        }
    });

    this.roundRenderLocation = false;

    this.render = (context,x,y,width,height) => {
        context.drawImage(buffer,x,y,width,height);
    };
}
export default LightSprite;
