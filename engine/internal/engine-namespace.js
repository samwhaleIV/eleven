import "../packer/main.js";
import Constants from "./constants.js";

const NAMESPACE_NAME = Constants.engineNamespace;

function MakeEngineNamespace(modules) {
    return Namespace.create({
        name: NAMESPACE_NAME,
        modules: modules
    });
}
export default MakeEngineNamespace;

