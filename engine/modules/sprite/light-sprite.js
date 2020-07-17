import LightCache from "../world2D/lighting/light-cache.js";

const LIGHT_RESOLUTION = 128;
let lightCache = null;

function LightSprite(x,y) {
    if(!lightCache) {
        lightCache = new LightCache();
        lightCache.cache(LIGHT_RESOLUTION);
    }
    this.x = x, this.y = y;
    this.width = 1, this.height = 1;
    this.collides = false;

    let gradientID = null;
    const buffer = new OffscreenCanvas(
        LIGHT_RESOLUTION,LIGHT_RESOLUTION
    );
    const context = buffer.getContext("2d",{alpha:true});

    const updateBuffer = () => {
        context.clearRect(0,0,buffer.width,buffer.height);
        lightCache.render(context,0,0,gradientID);
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
