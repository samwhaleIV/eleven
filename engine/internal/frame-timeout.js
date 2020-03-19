const FrameTimeout = duration => {
    if(isNaN(duration)) duration = 0;
    return new Promise(resolve=>{
        const start = performance.now();
        const frameTimeBind = timestamp => {
            if(timestamp - start >= duration) {
                resolve(); return;
            }
            requestAnimationFrame(frameTimeBind);
        };
        requestAnimationFrame(frameTimeBind);
    });
};
export default FrameTimeout;
