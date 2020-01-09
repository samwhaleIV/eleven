import InstallModules from "./modules.js";
import Singleton from "./singleton.js";

const INVALID_NAMESPACE = name => {
    throw Error(`Invalid namespace name '${name}'`);
};
const NAMESPACE_COLLISION = name => {
    throw Error(`Duplicate namespace '${name}'`);
};
const MISSING_NAMESPACE = name => {
    throw Error(`Namespace '${name}' not found`);
};
const GLOBAL_NAME_CONFLICT = name => {
    throw Error(`Name '${name}' already exists in global scope`);
};
const NAMESPACE_ALREADY_UPGRADED = name => {
    throw Error(`Namespace '${name}' has already been upgraded for global scope use`);
}

const NamespaceTable = new Object();

function ValidateNamespaceName(name) {
    if(!name || typeof name !== "string") {
        INVALID_NAMESPACE(name);
    }
    return name;
}

function CreateNamespace({name,modules}) {
    ValidateNamespaceName(name);
    if(name in NamespaceTable) {
        NAMESPACE_COLLISION(name);
    }
    return InstallModules({
        target: NamespaceTable,
        modules: modules,
        name: name
    });
}
function GetNamespace(name) {
    ValidateNamespaceName(name);
    if(name in NamespaceTable) {
        return NamespaceTable[name];
    } else {
        MISSING_NAMESPACE(name);
    }
}
function ListNamespaces() {
    return Object.keys(NamespaceTable);
}
function MakeGlobal(name) {
    const namespace = GetNamespace(name);
    if(name in globalThis) {
        if(globalThis[name] === namespace) {
            NAMESPACE_ALREADY_UPGRADED(name);
        } else {
            GLOBAL_NAME_CONFLICT(name);
        }
    }
    Object.defineProperty(globalThis,name,{
        value: namespace,
        writable: false,
        configurable: false
    });
}
function Namespace() {
    this.get = GetNamespace;
    this.create = CreateNamespace;
    this.list = ListNamespaces;
    this.makeGlobal = MakeGlobal;
    Object.freeze(this);
}
const namespace = new Namespace();

function InstallNamespaceDependencies() {
    Object.defineProperties(globalThis,{
        Namespace: {
            value: namespace,
            writable: false,
            configurable: false
        },
        Singleton: {
            value: Singleton,
            writable: false,
            configurable: false
        }
    });
}
InstallNamespaceDependencies();

export default namespace;
