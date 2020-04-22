const IMAGE_SOURCE = "../eleven/engine/modules/text/elven-font.png";
const ALPHA_COMPONENT = 3;

function FontDSC(image) {
    const {width, height} = image;

    const canvas = new OffscreenCanvas(width,height);
    const context = canvas.getContext("2d",{alpha:true});

    context.drawImage(image,0,0,width,height,0,0,width,height);

    const {data} = context.getImageData(0,0,width,height);

    let dataString = "";
    for(let i = 0;i<data.length;i+=4)
    dataString += data[i + ALPHA_COMPONENT] ? 1 : 0;

    const jsonData = `{
        "blob": "${dataString}",
        "width": ${width},
        "height": ${height}
    }`;

    return jsonData;
}
(()=>{
    const image = new Image();
    image.onload = () => {
        const jsonData = FontDSC(image);
        console.log(jsonData);
    }
    image.src = IMAGE_SOURCE;
})();

export default FontDSC;
