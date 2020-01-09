import Symbols from "./symbols.js";
export default InstallModules;

/*
  Modules have three instantiation modes.

  1. Manual instantiation: The module is a function that can be instantiated as many times as you want, like any other function.
     Native/non-singleton modules always use this mode.

  2. Automatic: The module is immediately instantiated as soon as it is parsed into the module group.
     See './singleton.js' for more info.

  3. Automatic (deferred): An automatic instantiation mode that generates the module as needed, not at its time of import.
     See './singleton.js' for more info.

*/

function isSingleton(module) {
    return module.isSingleton === Symbols.isSingleton;
}
function manualSingleton(module) {
    return module.manualSingleton === Symbols.manualSingleton;
}
function deferredSingleton(module) {
    return module.deferredSingleton === Symbols.deferredSingleton;
}

function getDefaultModuleTarget() {
    return new Object();
}
function bindDefaultTarget(module) {
    return module.bind(getDefaultModuleTarget());
}
function callDefaultTarget(module) {
    return module.call(getDefaultModuleTarget());
}

function parseAutomaticSingleton(moduleSet,module) {
    let propertyData;
    if(deferredSingleton(module)) {
        propertyData = {
            //Do not provide deferred singletons with parameters
            get: bindDefaultTarget(module), //Instantiated when module is first accessed
            enumerable: true
        };
    } else {
        propertyData = {
            //Do not provide automatic singletons with parameters
            value: callDefaultTarget(module), //Instantiated when module is imported
            enumerable: true
        };
    }
    Object.defineProperty(moduleSet,module.name,propertyData);
}

function parseManualModule(moduleSet,module,isSingleton) {
    if(isSingleton) {
        module = bindDefaultTarget(module);
    }
    Object.defineProperty(moduleSet,module.name,{
        value: module, //Instantiated manually
        enumerable: true
    });
}

function GetModuleSet(modules) {
    const moduleSet = new Object();
    modules.forEach(module => {
        const singletonMode = isSingleton(module);
        if(singletonMode && !manualSingleton(module)) {
            parseAutomaticSingleton(moduleSet,module);
        } else {
            parseManualModule(moduleSet,module,singletonMode);
        }
    });
    Object.freeze(moduleSet);
    return moduleSet;
}

function InstallModules({target,modules,name}) {
    const moduleSet = GetModuleSet(modules)
    Object.defineProperty(target,name,{
        value: moduleSet,
        writable: false,
        configurable: false,
        enumerable: true
    });
    return moduleSet;
}
