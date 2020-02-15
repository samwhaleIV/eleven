function MissingRender(context,size) {
    context.fillStyle = "black";
    context.fillRect(size.halfWidth-120,size.halfHeight-100,240,200);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.font = "16px sans-serif";
    context.fillText("Missing Render Method",size.halfWidth,size.halfHeight);
}

export default MissingRender;
