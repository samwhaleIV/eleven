function SpriteFollower(camera,sprite,active=true) {
    if(!sprite) sprite = null;
    let target = sprite;

    let enabled = false;
    let followX = true;
    let followY = true;

    const canProcess = () => target && (followX || followY);

    const processor = () => {
        if(!canProcess()) return;
        camera.grid.alignToPixels(target);
        if(followX) {
            let {x,xOffset,width} = target;
            if(xOffset) x += xOffset;
            x += width / 2 - 0.5;
            camera.x = x;
        }
        if(followY) {
            let {y,yOffset,height} = target;
            if(yOffset) y += yOffset;
            y += height / 2 - 0.5;
            camera.y = y;
        }
    };

    let processorID = null;
    const enable = () => {
        if(enabled) return;
        processorID = camera.addPostProcessor(processor);
        enabled = true;
    };
    const disable = () => {
        if(!enabled) return;
        camera.removePostProcessor(processorID);
        enabled = false;
    };

    Object.defineProperties(this,{
        target: {
            get: () => target,
            set: value => {
                if(!value) value = null;
                target = value;
            },
            enumerable: true
        },
        enabled: {
            get: () => enabled,
            set: value => {
                if(value) {
                    enable();
                } else {
                    disable();
                }
            },
            enumerable: true
        },
        followX: {
            get: () => followX,
            set: value => followX = value,
            enumerable: true
        },
        followY: {
            get: () => followY,
            set: value => followY = value,
            enumerable: true
        }
    });
    this.enable = enable;
    this.disable = disable;

    const reset = () => {
        this.enabled = active;
        target = sprite;
        followX = true;
        followY = true;
    };

    this.reset = reset;

    if(active) enable();
}
export default SpriteFollower;
