import namespace from "../packer/main.js";
import Constants from "./constants.js";

function InstallGlobalNamespace(modules) {
    const engineNamespace = Constants.engineNamespace;
    namespace.create({
        name: engineNamespace,
        modules: modules
    });
    namespace.makeGlobal(engineNamespace);
}
export default InstallGlobalNamespace;
