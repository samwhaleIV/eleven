import namespace from "../packer/main.js";

/*
  import namespace from "../packer/main.js";
  ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ 

  This is the most central import of the engine.
  It allows for the usage of two global objects:

  1. globalThis.Singleton
  2. globalThis.Namespace
*/


import Constants from "./constants.js";

const NAMESPACE_NAME = Constants.engineNamespace;

function MakeEngineNamespace(modules) {
    return namespace.create({
        name: NAMESPACE_NAME,
        modules: modules
    });
}
export default MakeEngineNamespace;

