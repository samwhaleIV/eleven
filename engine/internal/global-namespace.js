import namespace from "../packer/main.js";
import Constants from "./constants.js";

function InstallGlobalNamespace(modules) {
    const engineNamespace = Constants.engineNamespace;
    Object.defineProperty(globalThis,engineNamespace,{
        value: namespace.create({
            name: engineNamespace,
            modules: modules
        }),
        writable: false,
        configurable: false
    }); 
}
export default InstallGlobalNamespace;
