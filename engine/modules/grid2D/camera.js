import MultiLayer from "../../internal/multi-layer.js";

const DEFAULT_SCALE = 1;
const DEFAULT_X = 0;
const DEFAULT_Y = 0;

function Camera(grid) {

    this.grid = grid;

    let x, y;
    Object.defineProperties(this,{
        x: {
            get: () => x,
            set: value => x = value,
            enumerable: true
        },
        y: {
            get: () => y,
            set: value => y = value,
            enumerable: true
        },
    });

    const setDefaultPosition = () => {
        x = DEFAULT_X;
        y = DEFAULT_Y;
    };

    const centerX = (centerPoint=0.5) => {
        x = (grid.width - 1) * centerPoint;
        return this;
    };
    const centerY = (centerPoint=0.5) => {
        y = (grid.height - 1) * centerPoint;
        return this;
    };

    this.centerX = centerX; this.centerY = centerY;

    this.center = (centerPointX,centerPointY) => {
        centerX(centerPointX); centerY(centerPointY);
        return this;
    };

    setDefaultPosition();

    let scale = DEFAULT_SCALE;

    Object.defineProperty(this,"scale",{
        set: value => {
            if(value == scale) return;
            scale = value;
            grid.resize();
            return scale;
        },
        get: () => scale,
        enumerable: true
    });

    const updateLayers = new MultiLayer();

    this.setScaleUnsafe = value => {
        scale = value;
    };

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
        if(newX == x && newY == y) return;
        moving = true;
        return new Promise(resolve => {
            const startTime = performance.now();

            const startX = x;
            const startY = y;

            const xDifference = newX - startX;
            const yDifference = newY - startY;

            const ID = updateLayers.add(time => {
                let delta = (time.now - startTime) / duration;
                if(delta < 0) {
                    delta = 0;
                } else if(delta > 1) {
                    x = newX;
                    y = newY;
                    updateLayers.remove(ID);
                    moving = false;
                    resolve();
                    return;
                }
                x = startX + xDifference * delta;
                y = startY + yDifference * delta;
            });
        });
    };

    const postProcessors = new MultiLayer();

    this.addPostProcessor = postProcessors.add;
    this.removePostProcessor = postProcessors.remove;
    this.clearPostProcessors = postProcessors.clear;

    const paddingProcessor = () => {
        const {left,right,top,bottom} = grid.getArea();
        const {width,height} = grid;

        const leftClip = left < 0;
        const rightClip = right > width;
        if(!(leftClip && rightClip)) {
            if(leftClip) {
                x -= left;
            } else if(rightClip) {
                x += width - right;
                x = grid.roundToPixels(x);
            }
        }

        const topClip = top < 0;
        const bottomClip = bottom > height;
        if(!(topClip && bottomClip)) {
            if(topClip) {
                y -= top;
            } else if(bottomClip) {
                y += height - bottom;
                y = grid.roundToPixels(y);
            }
        }
    };

    let paddingEnabled = false;
    this.enablePadding = () => {
        paddingEnabled = true;
    };
    this.disablePadding = () => {
        paddingEnabled = false;
    };
    this.togglePadding = () => {
        paddingEnabled = !paddingEnabled;
    };

    Object.defineProperty(this,"padding",{
        get: () => paddingEnabled,
        set: value => paddingEnabled = Boolean(value),
        enumerable: true
    });

    this.update = time => {
        updateLayers.forEach(updater => updater(time));
        postProcessors.forEach(processor => processor(time));
        if(paddingEnabled) paddingProcessor();
    };
    Object.freeze(this);
}
export default Camera;
