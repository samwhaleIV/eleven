const FrameBoundTimeout = duration => {
    return new Promise(resolve=>{
        const start = performance.now();
        const frameTimeBind = timestamp => {
            if(timestamp - start > duration) {
                resolve(); return;
            }
            requestAnimationFrame(frameTimeBind);
        };
        requestAnimationFrame(frameTimeBind);
    });
};
export default FrameBoundTimeout;
