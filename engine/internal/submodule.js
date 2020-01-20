function runModuleInstaller(moduleSet,installer) {
    Object.values(moduleSet).forEach(installer);
}
function decapitaliseFirst(name) {
    return name.substring(0,1).toLowerCase() + name.substring(1);
}
function getModuleSet(modules) {
    const moduleSet = new Object();

    modules.forEach(module => {
        const name = decapitaliseFirst(module.name);
        const moduleInstance = new module(this,moduleSet);
        moduleSet[name] = moduleInstance;
    });

    Object.freeze(moduleSet);
    return moduleSet;
}
function Submodule(modules,installer) {
    const moduleSet = getModuleSet.call(this,modules);
    if(installer) {
        runModuleInstaller(moduleSet,installer);
    }
    Object.freeze(this);
}

export default Submodule;
