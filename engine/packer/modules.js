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

const MODULE_IS_NOT_A_FUNCTION = module => {
    throw Error(`Module '${module}' is not of type function`);
};
const MODULE_COLLISION = module => {
    throw Error(`Module set collision with module ${module.name}`);
};

const NAMESPACE_IDENTIFIER = Symbols.namespaceIdentifier;

function symbolMatch(module,symbol) {
    return symbol in module && module[symbol] === true;
}
function isSingleton(module) {
    return symbolMatch(module,Symbols.isSingleton);
}
function manualSingleton(module) {
    return symbolMatch(module,Symbols.manualSingleton);
}
function deferredSingleton(module) {
    return symbolMatch(module,Symbols.deferredSingleton);
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
    const name = module.name;
    if(isSingleton) {
        module = bindDefaultTarget(module);
        Object.defineProperty(module,"name",{value:name});
    }
    Object.defineProperty(moduleSet,name,{
        value: module, //Instantiated manually
        enumerable: true
    });
}

function parseModule(module) {
    if(typeof module !== "function") {
        MODULE_IS_NOT_A_FUNCTION(module);
    }
    if(module.name in this) {
        MODULE_COLLISION(module);
    }
    const singletonMode = isSingleton(module);
    if(singletonMode && !manualSingleton(module)) {
        parseAutomaticSingleton(this,module);
    } else {
        parseManualModule(this,module,singletonMode);
    }
}
function addNamespaceIdentifier(target,name) {
    Object.defineProperty(target,NAMESPACE_IDENTIFIER,{
        value: name,
        writable: false,
        configurable: false,
        enumerable: false
    });
}
function getModuleSet(modules,name) {
    const moduleSet = new Object();
    addNamespaceIdentifier(moduleSet,name);

    const moduleParser = parseModule.bind(moduleSet);
    modules.forEach(moduleParser);

    Object.freeze(moduleSet);
    return moduleSet;
}

function InstallModules({target,modules,name}) {
    const moduleSet = getModuleSet(modules,name);
    Object.defineProperty(target,name,{
        value: moduleSet,
        writable: false,
        configurable: false,
        enumerable: true
    });
    return moduleSet;
}
