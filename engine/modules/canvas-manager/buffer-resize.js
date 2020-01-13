function BufferResize(canvasManager) {

    const buffer = new OffscreenCanvas(0,0);
    const bufferContext = buffer.getContext("2d",{alpha:true});

    canvasManager.bufferResize = ({canvas,context},width,height) => {
        if(width > canvas.width || height > canvas.height) {
            buffer.width = canvas.width;
            buffer.height = canvas.height;
            bufferContext.drawImage(canvas,0,0);
    
            canvas.width = width;
            canvas.height = height;
    
            context.drawImage(buffer,0,0);
            buffer.width = 0;
            buffer.height = 0;
        }
    };

    Object.freeze(this);
}
export default BufferResize;
