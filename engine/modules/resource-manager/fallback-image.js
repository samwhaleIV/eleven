function GetFallbackImage() {
    const size = 256;
    const halfSize = size / 2;
    const offscreenCanvas = new OffscreenCanvas(size,size);
    const context = offscreenCanvas.getContext("2d");

    context.fillStyle = "#A80000";
    context.fillRect(0,0,size,size);

    context.fillStyle = "#FF0000";
    context.rect(halfSize,0,halfSize,halfSize);
    context.rect(0,halfSize,halfSize,halfSize);
    context.fill();

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.font = "12px sans-serif"

    return offscreenCanvas.transferToImageBitmap();

}
export default GetFallbackImage;
