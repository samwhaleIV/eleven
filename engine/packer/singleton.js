import Symbols from "./symbols.js";

/*
    There are 3 singleton modes.

    1. {autoInstantiation = false, deferInstantiation = true}: The module can be loaded with parameters.
       Subsequent instantiation attempts yield the original instance.
       This mode is not encouraged as it can cause idiosyncratic calling patterns.

    2. {autoInstantiation = true, deferInstantiation = false}: The module is immediately instantiated

    3. {autoInstantiation = true, deferInstantiation = true}: The module is instantiated the first time it is used

    (INVALID) 4. {autoInstantiation = false, deferInstantiation = false}: This is an invalid singleton mode.
*/

const ALREADY_INSTANTIATED = module => {
    console.warn(`Singleton module '${module.name}' has already been instantiated, ignoring parameters`);
};
const INVALID_INSTANTIATION_MODE = () => {
    throw Error("Cannot defer singleton instantiation for manual singletons");
};
const UNEXPECTED_PARAMETERS = module => {
    throw Error(`Manual singleton module '${module.name}' cannot have instance parameters`);
};
const INVALID_PARAMETERS = module => {
    throw Error(`Singleton module '${module.name}' has parameters that are not an array`);
};
const MISSING_MODULE = module => {
    throw Error(`Singleton declaration has no module. Expected module but got '${module}'`);
};
const INVALID_SINGLETON_NAME = name => {
    throw Error(`Singleton module with custom name of type '${typeof name}' is invalid`);
};

function Singleton({
    module,name,parameters,
    autoInstantiation=true,
    deferInstantiation=false,
    suppressReinstantiationWarning=false
}) {
    if(!module) {
        MISSING_MODULE(module);
    }
    if(!name) {
        name = module.name;
    } else if(typeof name !== "string" || !name) {
        INVALID_SINGLETON_NAME(name); 
    }
    if(!autoInstantiation && !deferInstantiation) {
        INVALID_INSTANTIATION_MODE();
    }
    if(parameters) {
        if(!autoInstantiation) {
            UNEXPECTED_PARAMETERS(module);
        }
        if(!Array.isArray(parameters)) {
            INVALID_PARAMETERS(module);
        }
    } else if(parameters !== undefined && autoInstantiation) {
        INVALID_PARAMETERS(module);
    }
    const singletonData = {
        name: {
            value: name
        },
        [Symbols.IsSingleton]: {
            value: true
        }
    };
    if(!autoInstantiation) {
        singletonData[Symbols.ManualSingleton] = {
            value: true
        };
    }
    if(deferInstantiation) {
        singletonData[Symbols.DeferredSingleton] = {
            value: true
        }
    }
    return (function(instanceParameters){
        let moduleInstance = null;
        return Object.freeze(Object.defineProperties(function(...parameters) {
            if(moduleInstance) {
                if(!suppressReinstantiationWarning && parameters.length) {
                    ALREADY_INSTANTIATED(module);
                }
                return moduleInstance;
            }
            if(autoInstantiation) {
                parameters = instanceParameters;
            }
            moduleInstance = this;
            module.apply(moduleInstance,parameters);
            return moduleInstance;
        },singletonData));
    })(parameters);
}
export default Singleton;
