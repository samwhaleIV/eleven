function CanvasManager() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d",{
        alpha: false,
        desynchronized: false
    });

    const sizeValues = new Object();
    const sizeValuesReadonly = new Object();

    const sizeValueTypes = [
        "width","height",
        "halfWidth","halfHeight",
        "quarterWidth","quarterHeight",
        "horizontalRatio","verticalRatio",
        "largestDimension","smallestDimension",
        "greaterWidth","greaterHeight","equalDimensions"
    ];

    sizeValueTypes.forEach(valueType => {
        sizeValues[valueType] = null;
        Object.defineProperty(sizeValuesReadonly,valueType,{
            get: function(){return sizeValues[valueType]}
        });
    });

    Object.seal(sizeValues);
    Object.freeze(sizeValuesReadonly);

    const updateSize = () => {
        const width =  window.innerWidth;
        const height = window.innerHeight;

        canvas.width =  width;
        canvas.height = height;

        sizeValues.width =  width;
        sizeValues.height = height;

        sizeValues.halfWidth =  width / 2;
        sizeValues.halfHeight = height / 2;

        sizeValues.quarterWidth =  width / 4;
        sizeValues.quarterHeight = height / 4;

        sizeValues.horizontalRatio = width / height;
        sizeValues.verticalRatio =   height / width;

        if(width >= height) {
            sizeValues.greaterHeight = false;
            sizeValues.greaterWidth =  true;
            sizeValues.largestDimension =  width;
            sizeValues.smallestDimension = height;
        } else {
            sizeValues.greaterHeight = true;
            sizeValues.greaterWidth =  false;
            sizeValues.largestDimension =  height;
            sizeValues.smallestDimension = width;
        }

        sizeValues.equalDimensions = width === height;    
    };

    const installDOM = () => {
        window.addEventListener("resize",updateSize);
        document.body.appendChild(canvas);
    };

    Object.defineProperty(this,"context",{value: context});

    Object.defineProperty(context,"size",{
        value: sizeValuesReadonly,
        writable: false,
        configurable: false
    });

    Object.freeze(this);
    Object.freeze(context);

    installDOM();
    updateSize();
}

export default Singleton({
    module: CanvasManager,
    autoInstantiate: true,
    deferInstallation: true
});
