const DEFAULT_SCALE = 1;
const DEFAULT_X = 0;
const DEFAULT_Y = 0;

function Camera(world) {
    this.x = DEFAULT_X;
    this.y = DEFAULT_Y;
    let scale = DEFAULT_SCALE;

    Object.defineProperty(this,"scale",{
        set: value => {
            if(value == scale) return;
            scale = value;
            world.resize();
            return scale;
        },
        get: () => {
            return scale;
        },
        enumerable: true
    });

    this.reset = () => {
        this.x = DEFAULT_X;
        this.y = DEFAULT_Y;
        this.scale = DEFAULT_SCALE;
    }

    let updater = null;
    this.moveTo = (newX,newY,duration) => {
        if(updater !== null) return;
        return new Promise(resolve => {
            let start = performance.now();

            const startX = this.x;
            const startY = this.y;

            const xDifference = newX - this.x;
            const yDifference = newY - this.y;

            updater = time => {
                let delta = (time.now - start) / duration;
                if(delta < 0) {
                    delta = 0;
                } else if(delta > 1) {
                    this.x = newX;
                    this.y = newY;
                    updater = null;
                    resolve();
                    return;
                }
                this.x = startX + xDifference * delta;
                this.y = startY + yDifference * delta;
            };
        });
    };

    this.update = time => {
        if(updater !== null) {
            updater(time);
        }
    };
    Object.seal(this);
}
export default Camera;
