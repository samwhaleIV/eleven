import InstallHitBox from "../sprite/hitbox.js";

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;

const ANIMATION_ROW_COUNT = 4;
const FRAME_TIME = 100;

//Direction matrix conforms to specification of './player/player-directions.js'
const DIRECTION_MATRIX = [SPRITE_WIDTH,SPRITE_WIDTH*2,0,SPRITE_WIDTH*3];

const DEFAULT_DIRECTION = 2;

function AnimatedSprite(texture,x,y) {

    if(!x) x = 0; if(!y) y = 0;

    this.x = x, this.y = y;
    this.width = 1, this.height = 1;

    this.direction = DEFAULT_DIRECTION;

    InstallHitBox(this,12/16,12/16);
    this.yOffset = -(2 / 16);

    const getAnimationRow = time => {
        return Math.floor(time.now / FRAME_TIME) % ANIMATION_ROW_COUNT * SPRITE_HEIGHT;
    };

    this.render = (context,x,y,width,height,time) => {
        const textureX = DIRECTION_MATRIX[this.direction];
        const textureY = this.moving ? getAnimationRow(time) : 0;

        context.drawImage(
            texture,
            textureX,textureY,SPRITE_WIDTH,SPRITE_HEIGHT,
            x,y,width,height
        );
    };
}
export default AnimatedSprite;
