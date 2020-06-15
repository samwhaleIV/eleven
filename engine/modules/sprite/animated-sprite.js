import PlayerDirections from "../world2D/player/player-directions.js";

const BASE_FRAME_SIZE = 16;

const ANIMATION_ROW_COUNT = 4;
const FRAME_TIME = 100;

const DIRECTION_LOOKUP = {
    "up": PlayerDirections.Up,
    "right": PlayerDirections.Right,
    "down": PlayerDirections.Down,
    "left": PlayerDirections.Left
};

const DEFAULT_DIRECTION = 2;

function AnimatedSprite(texture,x,y,spriteScaleX,spriteScaleY) {
    if(isNaN(spriteScaleX)) spriteScaleX = 1;
    if(isNaN(spriteScaleY)) spriteScaleY = 1;

    const frameWidth = BASE_FRAME_SIZE * spriteScaleX;
    const frameHeight = BASE_FRAME_SIZE * spriteScaleY;

    //Conforms to PlayerDirections
    const directionMatrix = Object.freeze([
        frameWidth,frameWidth*2,0,frameWidth*3
    ]);

    this.texture = texture; texture = null;

    if(isNaN(x)) x = 0; if(isNaN(y)) y = 0;

    this.directionMatrix = directionMatrix;
    this.x = x, this.y = y;
    this.xOffset = 0, this.yOffset = 0;
    this.width = spriteScaleX;
    this.height = spriteScaleY;

    let direction = DEFAULT_DIRECTION;

    this.getPosition = () => [this.x,this.y];
    this.setPosition = (x,y) => (this.x = x, this.y = y);

    Object.defineProperties(this,{
        camX: {
            get: () => this.x + this.xOffset,
            enumerable: true
        },
        camY: {
            get: () => this.y + this.yOffset,
            enumerable: true
        },
        direction: {
            get: () => direction,
            set: value => {
                if(typeof value === "string") {
                    const lookupResult = DIRECTION_LOOKUP[value];
                    if(isNaN(lookupResult)) return;
                    value = lookupResult;
                }
                direction = value;
            },
            enumerable: true
        }
    });

    let animationStart = 0;

    const getAnimationRow = time => {
        const t = time.now - animationStart;
        const row = Math.floor(t / FRAME_TIME);
        return row % ANIMATION_ROW_COUNT * frameHeight;
    };

    const getTextureY = time => {
        if(this.moving) {
            if(animationStart === 0) {
                animationStart = time.now - FRAME_TIME;
            }
            return getAnimationRow(time);
        } else {
            if(animationStart !== 0) {
                const row = getAnimationRow(time);

                if((row / frameHeight) % 2 === 0) animationStart = 0;

                return row;
            }
            return 0;
        }
    };

    this.roundRenderPosition = true;

    this.render = (context,x,y,width,height,time) => {
        const textureX = directionMatrix[direction];
        const textureY = getTextureY(time);

        context.drawImage(
            this.texture,textureX,textureY,frameWidth,frameHeight,
            x,y,width,height
        );
    };
}
export default AnimatedSprite;
