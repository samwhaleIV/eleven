import Emitter from "./emitter.js";

const DEFAULT_FIRE_RATE = 500;

function EmitterPool(data,count) {
    if(count < 1) count = 0;

    const emitters = new Array(count);
    for(let i = 0;i<count;i++) {
        emitters[i] = new Emitter(data);
    }

    const fire = interval => {
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

    this.fire = callback => {
        let i = count - 1;
        emitters[i--].fire(callback);
        while(i >= 0) {
            emitters[i].fire();
            i--;
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
                fire(fireRate);
                const delay = fireRate * count + pauseTime;
                await frameDelay(delay);
            }
        })();
    };

    let scale = 1;
    Object.defineProperties(this,{
        stream: {
            get: () => stream,
            set: value => stream = value,
            enumerable: true
        },
        scale: {
            get: () => scale,
            set: value => {
                for(let i = 0;i<count;i++) {
                    emitters[i].scale = value;
                }
                scale = value;
            }
        }
    });

    this.stopStream = () => {
        const wasStreaming = streaming;
        streaming = false;
        return wasStreaming;
    };

    Object.freeze(this);
}
export default EmitterPool;
