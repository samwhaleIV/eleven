function SmartCache() {
    let IDCounter = 0;
    const cache = {};
    const drop = (ID,callback) => {
        delete cache[ID];
        callback();
    };
    this.clear = () => {
        const entries = Object.entries(cache);
        entries.forEach((
            [ID,callback]
        )=>drop(ID,callback));
        return entries.length >= 1;
    };
    this.add = release => {
        cache[IDCounter] = release;
        return ++IDCounter;
    };
    this.release = ID => {
        /*
            This method is safe to call multiple times so that dropped
            items aren't incorrectly handled more than once, but also doesn't result in thread failure.
            
            For example, a master fader and a sub fader both have directive to release the same item.
            The release handler can only be called once in this instance, and it's not an error to call it again.
            This behavior is ensured because IDCounter increases upwards, always ensuring a unique identifier.
        */
        const canRelease = ID in cache;
        if(canRelease) drop(ID,cache[ID]);
        return canRelease;
    };
    this.contains = ID => {
        return ID in cache;
    };
    Object.freeze(this);
}
export default SmartCache;
