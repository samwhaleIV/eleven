import namespace from "../packer/main.js";
import Constants from "./constants.js";

const ENGINE_NAMESPACE = Constants.engineNamespace;

function InstallGlobalNamespace(modules) {
    namespace.makeGlobal(namespace.create({
        name: ENGINE_NAMESPACE,
        modules: modules
    }));
}
export default InstallGlobalNamespace;
