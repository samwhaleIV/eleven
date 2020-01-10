//Warning: Not the engine's most proudest achievement

const FrameHelper = Object.freeze({
    GetDeepestFrame: function(frame) {
        if(!frame) {
            return null;
        }
        let child = frame.child;
        while(child) {
            stack.push(frame);
            if(frame.opaque) {
                stack.splice(0);
            }
            frame = child;
            child = frame.child;
        }
        return frame;
    },
    RenderFrame: function(...parameters)  {
        const stack = [];
        let frame = this;
        let child = frame.child;
        while(child) {
            stack.push(frame);
            if(frame.opaque) {
                stack.splice(0);
            }
            frame = child;
            child = frame.child;
        }
        stack.push(frame);
        if(frame.opaque) {
            stack.splice(0);
        }
        let i = 0;
        while(i<stack.length) {
            stack[i].render(...parameters);
            i++;
        }
    },
    NotifyAll: function(frame,actionName,...parameters) {
        if(!frame) {
            return;
        }
        let child = frame.child;
        while(child) {
            const action = frame[actionName];
            if(action) {
                action(...parameters);
            }
            frame = child;
            child = frame.child;
        }
        const action = frame[actionName];
        if(action) {
            action(...parameters);
        }
    }
});
export default FrameHelper;
