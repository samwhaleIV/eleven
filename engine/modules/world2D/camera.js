import MultiLayer from "../../internal/multi-layer.js";

const DEFAULT_SCALE = 1;
const DEFAULT_X = 0;
const DEFAULT_Y = 0;

function Camera(world) {
    const setDefaultPosition = () => {
        this.x = DEFAULT_X;
        this.y = DEFAULT_Y;
    };
    this.center = (x=0.5,y=0.5) => {
        this.x = (world.width - 1) * x;
        this.y = (world.height - 1) * y;
        return this;
    };

    setDefaultPosition();

    let scale = DEFAULT_SCALE;

    Object.defineProperty(this,"scale",{
        set: value => {
            if(value == scale) return;
            scale = value;
            world.resize();
            return scale;
        },
        get: () => scale,
        enumerable: true
    });

    const updateLayers = new MultiLayer();

    this.reset = () => {
        const fakeTime = {
            now: Infinity, delta: 0
        };
        updateLayers.clear(updater => updater(fakeTime));
        setDefaultPosition();
        this.scale = DEFAULT_SCALE;
        return this;
    };

    let zooming = false;
    this.zoomTo = (newScale,duration) => {
        if(zooming) return;
        if(newScale == scale) return;
        zooming = true;
        return new Promise(resolve => {
            const startTime = performance.now();

            const startScale = scale;
            const scaleDifference = newScale - startScale;

            const ID = updateLayers.add(time => {
                let delta = (time.now - startTime) / duration;
                if(delta < 0) {
                    delta = 0;
                } else if(delta > 1) {
                    this.scale = newScale;
                    updateLayers.remove(ID);
                    zooming = false;
                    resolve();
                    return;
                }
                this.scale = startScale + scaleDifference * delta;
            });
        })
    };

    let moving = false;
    this.moveTo = (newX,newY,duration) => {
        if(moving) return;
        if(newX == this.x && newY == this.y) return;
        moving = true;
        return new Promise(resolve => {
            const startTime = performance.now();

            const startX = this.x;
            const startY = this.y;

            const xDifference = newX - startX;
            const yDifference = newY - startY;

            const ID = updateLayers.add(time => {
                let delta = (time.now - startTime) / duration;
                if(delta < 0) {
                    delta = 0;
                } else if(delta > 1) {
                    this.x = newX;
                    this.y = newY;
                    updateLayers.remove(ID);
                    moving = false;
                    resolve();
                    return;
                }
                this.x = startX + xDifference * delta;
                this.y = startY + yDifference * delta;
            });
        });
    };

    this.update = time => {
        updateLayers.forEach(updater => updater(time));
    };
    Object.seal(this);
}
export default Camera;
