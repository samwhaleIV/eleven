import Emitter from "./emitter.js";
import FrameTimeout from "../../internal/frame-timeout.js";

const DEFAULT_FIRE_RATE = 500;

function EmitterPool(data,count) {
    if(count < 1) count = 0;

    const emitters = new Array(count);
    for(let i = 0;i<count;i++) {
        emitters[i] = new Emitter(data);
    }

    this.fire = interval => {
        let i = 0;
        if(interval) {
            do {
                setTimeout(emitters[i].fire,interval*i);
                i++;
            } while(i < count);
        } else {
            do {
                emitters[i].fire();
                i++;
            } while(i < count);
        }
    };

    this.render = (context,x,y,time) => {
        let i = 0;
        do {
            emitters[i].render(context,x,y,time);
            i++;
        } while(i<count);
    };

    let streaming = false;

    let stream = (fireRate,pauseTime) => {
        if(isNaN(fireRate)) {
            fireRate = DEFAULT_FIRE_RATE;
        }
        if(isNaN(pauseTime)) {
            pauseTime = 0;
        }
        if(streaming) return;
        streaming = true;
        (async () => {
            while(true) {
                if(!streaming) return;
                this.fire(fireRate);
                const delay = fireRate * count + pauseTime;
                await FrameTimeout(delay);
            }
        })();
    };

    Object.defineProperty(this,"stream",{
        get: () => stream,
        set: value => stream = value,
        enumerable: true
    });

    this.stopStream = () => {
        const wasStreaming = streaming;
        streaming = false;
        return wasStreaming;
    };

    Object.freeze(this);
}
export default EmitterPool;
