const DEFAULT_SETTINGS = Object.freeze({
    //todo
});

function ManagedGamepad() {
    const settings = Object.seal(
        Object.assign(new Object(),DEFAULT_SETTINGS)
    );
    this.configure = newSettings => {
        Object.assign(settings,newSettings);
    };
    const processGamepadData = function() {
        //this === a frame
        //todo
    };
    this.getPollingFilter = target => {
        return processGamepadData.bind(target);
    };
    Object.freeze(this);
}
export default ManagedGamepad;
