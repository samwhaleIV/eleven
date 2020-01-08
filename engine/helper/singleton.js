import Constants from "./constants.js";

/*
    There are 3 singleton modes.

    1. {autoInstantiate = false, deferInstallation = false}: The module can be loaded with parameters.
       Subsequent instantiation attempts yield the original instance.
       This mode is not encouraged as it can cause idiosyncratic calling patterns.

    2. {autoInstantiate = true, deferInstallation = false}: The module is immediately instantiated

    3. {autoInstantiate = true, deferInstallation = true}: The module is instantiated the first time it is used

    (INVALID) 4. {autoInstantiate = false, deferInstallation = true}: is in invalid singleton mode.
*/

const ALREADY_INSTANTIATED = module => {
    console.warn(`Singleton module '${module.name}' has already been instantiated!`);
};
const INVALID_INSTANTIATION_MODE = () => {
    throw Error("Cannot defer singleton instantiation for manual singletons");
};

function Singleton({
    module,autoInstantiate=true,deferInstallation=false
}) {
    if(!autoInstantiate && deferInstallation) {
        INVALID_INSTANTIATION_MODE();
    }
    const singletonData = {
        name: {
            value: module.name
        },
        isSingleton: {
            value: Constants.isSingleton
        }
    };
    if(!autoInstantiate) {
        singletonData.manualSingleton = {
            value: Constants.manualSingleton
        };
    }
    if(deferInstallation) {
        singletonData.deferredSingleton = {
            value: Constants.deferredSingleton
        }
    }
    return (function(){
        let moduleInstance = null;
        return Object.freeze(Object.defineProperties(function(...parameters) {
            if(moduleInstance) {
                if(parameters.length) {
                    ALREADY_INSTANTIATED(module);
                }
                return moduleInstance;
            }
            moduleInstance = this;
            module.apply(moduleInstance,parameters);
            return moduleInstance;
        },singletonData));
    })();
}
export default Singleton;
