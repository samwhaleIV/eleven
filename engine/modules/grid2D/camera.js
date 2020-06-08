import MultiLayer from "../../internal/multi-layer.js";

const DEFAULT_SCALE = 1;
const DEFAULT_X = 0;
const DEFAULT_Y = 0;

const DEFAULT_PADDING_SETTING = false;

const BAD_MOVEMENT_OPERATION = () => {
    throw Error("The first movement parameter is an object, but it lacks a camX or a camY value!");
};

function Camera(grid) {

    this.grid = grid; let x = DEFAULT_X, y = DEFAULT_Y;

    const setDefaultPosition = () => x = DEFAULT_X; y = DEFAULT_Y;

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

    let paddingEnabled = DEFAULT_PADDING_SETTING,
    horizontalPaddingEnabled = true, verticalPaddingEnabled = true;

    this.enablePadding = () => paddingEnabled = true;
    this.disablePadding = () => paddingEnabled = false;
    this.togglePadding = () => paddingEnabled = !paddingEnabled;

    const enableHorizontalPadding = () => {
        horizontalPaddingEnabled = true;
        if(paddingEnabled) return;
        paddingEnabled = true;
        verticalPaddingEnabled = false;
    };
    const enableVerticalPadding = () => {
        verticalPaddingEnabled = true;
        if(paddingEnabled) return;
        paddingEnabled = true;
        horizontalPaddingEnabled = false;
    };
    const disableHorizontalPadding = () => {
        horizontalPaddingEnabled = false;
        if(!verticalPaddingEnabled) paddingEnabled = false;
    };
    const disableVerticalPadding = () => {
        verticalPaddingEnabled = false;
        if(!horizontalPaddingEnabled) paddingEnabled = false;
    };

    const setHorizontalPadding = value => {
        if(value) enableHorizontalPadding(); else disableHorizontalPadding();
    };
    const setVerticalPadding = value => {
        if(value) enableVerticalPadding(); else disableVerticalPadding();
    };

    this.enableHorizontalPadding = enableHorizontalPadding;
    this.enableVerticalPadding = enableVerticalPadding;

    this.disableHorizontalPadding = disableHorizontalPadding;
    this.disableVerticalPadding = disableVerticalPadding;

    let scale = DEFAULT_SCALE;
    const updateLayers = new MultiLayer();
    this.setScaleUnsafe = value => scale = value;
    
    const postProcessors = new MultiLayer();
    this.addPostProcessor = postProcessors.add;
    this.removePostProcessor = postProcessors.remove;
    this.clearPostProcessors = postProcessors.clear;

    let zooming = false; let moving = false;
    let zoomResolve = null, moveResolve = null;

    this.reset = () => {
        updateLayers.clear();

        moving = false, zooming = false;

        if(zoomResolve) zoomResolve(), zoomResolve = null;
        if(moveResolve) moveResolve(), moveResolve = null;
        
        this.clearPostProcessors();

        paddingEnabled = DEFAULT_PADDING_SETTING;
        horizontalPaddingEnabled = true;
        verticalPaddingEnabled = true;

        setDefaultPosition();
        this.scale = DEFAULT_SCALE;
        return this;
    };

    this.getPosition = () => [x,y,scale];

    this.zoomTo = (newScale,duration) => {
        if(zooming) return;
        if(newScale == scale) return;
        zooming = true;
        return new Promise(resolve => {
            zoomResolve = resolve;

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

    this.moveTo = (newX,newY,duration) => {
        if(moving) return;

        if(typeof newX === "object") {
            //if the first parameter is an object with camX and camY values set newX and newY and shift newY to duration
            const {camX,camY} = newX;
            if(camX !== undefined && camY !== undefined) {
                duration = newY, newX = camX, newY = camY;
            } else {
                BAD_MOVEMENT_OPERATION();
            }
        }

        if(newX == x && newY == y) return;
        moving = true;
        return new Promise(resolve => {
            moveResolve = resolve;

            const startTime = performance.now();

            const startX = x, startY = y;

            const xDifference = newX - startX, yDifference = newY - startY;

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
                x = startX + xDifference * delta, y = startY + yDifference * delta;
            });
        });
    };

    const paddingProcessor = () => {
        const area = grid.getArea();

        if(horizontalPaddingEnabled) {
            const {left,right} = area, {width} = grid;
            const leftClip = left < 0, rightClip = right > width;
            if(!(leftClip && rightClip)) {
                if(leftClip) {
                    x -= left;
                } else if(rightClip) {
                    x = grid.roundToPixels(x + width - right);
                }
            }
        }

        if(verticalPaddingEnabled) {
            const {top,bottom} = area, {height} = grid;
            const topClip = top < 0, bottomClip = bottom > height;
            if(!(topClip && bottomClip)) {
                if(topClip) {
                    y -= top;
                } else if(bottomClip) {
                    y = grid.roundToPixels(y + height - bottom);
                }
            }
        };
    };

    this.update = time => {
        updateLayers.forEach(updater => updater(time));
        postProcessors.forEach(processor => processor(time));
        if(paddingEnabled) paddingProcessor();
    };

    Object.defineProperties(this,{
        padding: {
            get: () => paddingEnabled,
            set: value => {
                paddingEnabled = Boolean(value);

                if(!paddingEnabled || !(
                    horizontalPaddingEnabled || verticalPaddingEnabled
                )) return;

                horizontalPaddingEnabled = true;
                verticalPaddingEnabled = true;
            },
            enumerable: true
        },
        horizontalPadding: {
            get: () => horizontalPaddingEnabled,
            set: setHorizontalPadding,
            enumerable: true
        },
        verticalPadding: {
            get: () => verticalPaddingEnabled,
            set: setVerticalPadding,
            enumerable: true
        },
        scale: {
            set: value => {
                if(value === scale) return;
                scale = value;
                grid.resize();
                return scale;
            },
            get: () => scale,
            enumerable: true
        },
        x: {
            get: () => x,
            set: value => x = value,
            enumerable: true
        },
        y: {
            get: () => y,
            set: value => y = value,
            enumerable: true
        }
    });

    Object.freeze(this);
}
export default Camera;
