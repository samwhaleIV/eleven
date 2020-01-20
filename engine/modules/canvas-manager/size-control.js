function SizeControl(canvasManager,modules) {

    let fixedSize = null;

    const resizeModule = modules.resize;

    const setFullSize = () => {
        resizeModule.setFullSize();
    };
    const setFixedSize = () => {
        resizeModule.setFixedSize(
            fixedSize.width,fixedSize.height
        );
    };

    this.setDefault = () => {
        if(fixedSize) {
            setFixedSize();
        } else {
            setFullSize();
        }
    };
    const sizeControl = Object.freeze({
        reset: function() {
            fixedSize = null;
            setFullSize();
        },
        set: function(width,height) {
            if(fixedSize) {
                fixedSize.width = width;
                fixedSize.height = height;
            } else {
                fixedSize = Object.seal({width,height})
            }
            setFixedSize();
        },
        get: function() {
            if(fixedSize) {
                return Object.assign(new Object(),fixedSize);
            } else {
                return undefined;
            }
        }
    });

    this.sizeControl = sizeControl;
    canvasManager.sizeControl = sizeControl;

    Object.freeze(this);
}

export default SizeControl;
