const requiredBase = 8;

const testDimension = dimension => {
    if(isNaN(dimension)) throw Error("Dimension is not a number!");
    const value = dimension;
    dimension *= requiredBase;
    if(dimension !== Math.trunc(dimension)) {
        throw Error(`Invalid dimension value: (${value} * ${requiredBase} !== Math.trunc(${value} * ${requiredBase}))`);
    }
};

function InstallHitBox(target,width,height) {

    testDimension(width), testDimension(height);

    let hitBoxWidth = width;
    let hitBoxHeight = height;

    const hitBox = Object.seal({
        width: hitBoxWidth,
        height: hitBoxHeight,
        target, isHitBox: true,
        x: null, y: null
    });

    const getHitBox = () => {
        hitBoxWidth = hitBox.width;
        hitBoxHeight = hitBox.height;

        const {x,y,width,height} = target;

        const xCenter = width / 2 + x;
        const yCenter = height / 2 + y;

        hitBox.x = xCenter - (hitBoxWidth / 2);
        hitBox.y = yCenter - (hitBoxHeight / 2);
        return hitBox;
    };

    Object.defineProperty(target,"hitBox",{
        get: getHitBox,
        configurable: true,
        enumerable: false
    });
}
export default InstallHitBox;
