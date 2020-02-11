//This doesn't really need to be its own thing, but #modularity-vibes

const Wrap = (callback,parameters) => {
    if(callback) callback(...parameters);
};
const WrapBind = (callback,parameters) => {
    return () => {
        if(callback) callback(...parameters);
    };
};

export default Object.freeze({
    Wrap, WrapBind
});
export { Wrap, WrapBind }
