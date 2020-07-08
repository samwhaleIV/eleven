function BitmapToURI(image,x,y,width,height) {

    if(isNaN(x)) x = 0; if(isNaN(y)) y = 0;

    if(isNaN(width)) width = image.width; if(isNaN(height)) height = image.height;

    const buffer = document.createElement("canvas");
    buffer.width = width, buffer.height = height;

    const context = buffer.getContext("2d",{alpha:true});
    context.drawImage(image,x,y,width,height,0,0,width,height);

    const URI = buffer.toDataURL("image/png",1);
    return URI;
}
export default BitmapToURI;
