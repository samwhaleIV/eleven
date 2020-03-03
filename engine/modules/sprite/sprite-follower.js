function SpriteFollower(camera,sprite,active=true) {

    if(!sprite) sprite = null;
    let target = sprite;
    sprite = null;

    let enabled = false;
    let followX = true;
    let followY = true;

    const canProcess = () => target && (followX || followY);

    const processor = () => {
        if(!canProcess()) return;
        camera.grid.alignToPixels(target);
        if(followX) camera.x = target.x;
        if(followY) camera.y = target.y;
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

    if(active) enable();
}
export default SpriteFollower;
