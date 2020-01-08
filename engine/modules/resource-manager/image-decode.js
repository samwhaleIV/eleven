import Constants from "../../internal/constants.js";

const BITMAP_DECODE_FAILURE = () => {
    throw "Failure decoding image to bitmap";
};

function getBitmap(image) {
    const settings = Object.assign({
        resizeWidth: image.width,
        resizeHeight: image.height
    },Constants.bitmapSettings)
    return createImageBitmap(
        image,0,0,image.width,image.height,settings
    );
}

function imageLoadResolver(urlObject) {
    const image = new Image();
    return new Promise(resolve => {
        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            resolve(null);
        };
        image.src = urlObject;
    })
}

function DecodeImageResponse(response) {
    let urlObject = null;
    const clearURLObject = () => {
        if(urlObject) {
            URL.revokeObjectURL(urlObject);
        }
    };
    return response.blob().then(blob =>
        imageLoadResolver(urlObject = URL.createObjectURL(blob))
    ).then(image => {
        if(!image) {
            BITMAP_DECODE_FAILURE();
        }
        return getBitmap(image);
    }).then(bitmapImage=>{
        clearURLObject();
        return bitmapImage;
    }).catch(error=>{
        clearURLObject();
        throw error;
    });
}
export default DecodeImageResponse;
