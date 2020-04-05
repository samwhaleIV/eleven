const DEFAULT_DURATION = 1000;

const sendCallback = async callback => callback();

function Fader(renderer) {
    this.startTime = null, this.polarity = true;

    this.duration = DEFAULT_DURATION, this.callback = null;

    this.render = (context,size,time) => {
        const {startTime} = this; if(startTime === null) return;

        let t = (time.now - startTime) / this.duration;

        if(t > 1) t = 1; else if(t < 0) t = 0;
    
        renderer(context,size,this.polarity ? t : 1 - t);

        const {callback} = this;
        if(t === 1 && callback) sendCallback(callback);
    };
}
Fader.prototype.reverse = function(newCallback) {
    const now = performance.now();

    let t = (now - this.startTime) / this.duration;
    t = Math.min(Math.max(t,0),1);

    this.startTime = now + this.duration * (t - 1);

    this.polarity = !this.polarity;
    if(newCallback !== undefined) {
        this.callback = newCallback;
    } else {
        return new Promise(resolve=>this.callback = resolve);
    }
}
Fader.prototype.start = function({
    polarity=true,duration,callback
}) {
    if(this.startTime !== null) return false;
    if(!isNaN(duration)) {
        this.duration = duration;
    }
    if(polarity !== undefined) {
        this.polarity = Boolean(polarity);
    }
    if(callback) this.callback = callback;

    this.startTime = performance.now();
    return true;
}
Fader.prototype.fade = function(polarity,duration) {
    return new Promise(resolve => {
        this.start({polarity,duration,callback:resolve})
    });
}
Fader.prototype.fadeFrom = function(duration) {
    return this.fade(false,duration);
}
Fader.prototype.fadeTo = function(duration) {
    return this.fade(true,duration);
}

/* English is hard */
Fader.prototype.fadeOut = Fader.prototype.fadeTo;
Fader.prototype.fadeIn = Fader.prototype.fadeFrom;

export default Fader;
