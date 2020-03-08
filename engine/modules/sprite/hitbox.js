function InstallHitBox(target,width,height) {

    const halfHitBoxWidth = width / 2;
    const halfHitBoxHeight = height / 2;

    const hitBox = {width, height};

    const getHitBox = () => {
        const {x,y,width,height} = target;
        const xCenter = width / 2 + x;
        const yCenter = height / 2 + y;

        hitBox.x = xCenter - halfHitBoxWidth;
        hitBox.y = yCenter - halfHitBoxHeight;
        return hitBox;
    };

    Object.defineProperty(target,"hitBox",{
        get: getHitBox,
        configurable: true,
        enumerable: false
    });
}
export default InstallHitBox;
