const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;

const ANIMATION_ROW_COUNT = 4;
const FRAME_TIME = 100;

//Direction matrix conforms to specification of './player/player-directions.js'
const DIRECTION_MATRIX = Object.freeze([
    SPRITE_WIDTH,SPRITE_WIDTH*2,0,SPRITE_WIDTH*3
]);


const DIRECTION_LOOKUP = {
    "up": 0,
    "right": 1,
    "down": 2,
    "left": 3
};

const DEFAULT_DIRECTION = 2;

function AnimatedSprite(texture,x,y) {

    if(!x) x = 0; if(!y) y = 0;

    Object.defineProperty(this,"directionMatrix",{
        value: DIRECTION_MATRIX,
        enumerable: true
    });

    this.x = x, this.y = y;
    this.width = 1, this.height = 1;

    let direction = DEFAULT_DIRECTION;

    Object.defineProperty(this,"direction",{
        get: () => direction,
        set: value => {
            if(typeof value === "string") {
                value = DIRECTION_LOOKUP[value] || 2;
            }
            direction = value;
        }
    });

    let animationStart = 0;

    const getAnimationRow = time => {
        const t = time.now - animationStart;
        const row = Math.floor(t / FRAME_TIME);
        return row % ANIMATION_ROW_COUNT * SPRITE_HEIGHT;
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

                if((row / SPRITE_HEIGHT) % 2 === 0) animationStart = 0;

                return row;
            }
            return 0;
        }
    };

    this.render = (context,x,y,width,height,time) => {
        const textureX = this.directionMatrix[direction];
        const textureY = getTextureY(time);

        context.drawImage(
            texture,
            textureX,textureY,SPRITE_WIDTH,SPRITE_HEIGHT,
            x,y,width,height
        );
    };
}
export default AnimatedSprite;
