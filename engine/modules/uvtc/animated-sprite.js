const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;

const ANIMATION_ROW_COUNT = 4;
const FRAME_TIME = 100;

//Direction matrix conforms to specification of './player/player-directions.js'
const DIRECTION_MATRIX = Object.freeze([
    SPRITE_WIDTH,SPRITE_WIDTH*2,0,SPRITE_WIDTH*3
]);

const DEFAULT_DIRECTION = 2;

function AnimatedSprite(texture,x,y) {

    if(!x) x = 0; if(!y) y = 0;

    Object.defineProperty(this,"directionMatrix",{
        value: DIRECTION_MATRIX,
        enumerable: true
    });

    this.x = x, this.y = y;
    this.width = 1, this.height = 1;

    this.direction = DEFAULT_DIRECTION;

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
                console.log(animationStart-time.now);
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
        const textureX = this.directionMatrix[this.direction];
        const textureY = getTextureY(time);
        if(textureY < 0) {
            console.log(textureY);
            const result = getAnimationRow(time);
            console.log(textureY);
        }

        context.drawImage(
            texture,
            textureX,textureY,SPRITE_WIDTH,SPRITE_HEIGHT,
            x,y,width,height
        );
    };
}
export default AnimatedSprite;
