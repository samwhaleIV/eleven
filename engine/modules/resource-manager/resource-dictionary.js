import {TypeIterator, TypeNameIterator, TypeSymbolIterator} from "./resource-types.js";
import CacheController from "./cache-controller.js";

const FILE_NOT_IN_CONTAINER = file => {
    throw Error(`File '${file}' not in container!`);
};
const NO_CONTAINER_OF_TYPE = type => {
    throw Error(`No container of type '${type}'!`);
};

const GetEntry = CacheController.get;
const EntryExists = CacheController.has;
const RemoveEntry = CacheController.remove;

const proxyHandlers = (()=>{
    const getProxyHandler = type => {
        const tryDropCacheValue = (container,file) => {
            const value = container[file];
            const cacheValue = GetEntry(file,type);
            if(value !== cacheValue) return;
            RemoveEntry(file,type);
        };
        return {    
            deleteProperty(container,file) {
                if(!(file in container)) return false;
                const inCache = EntryExists(file,type);
                if(inCache) tryDropCacheValue(container,file);
                delete container[file];
                return true;
            }
        };
    };
    const handlers = new Object();
    const addHandler = type => {
        return handlers[type] = getProxyHandler(type);
    };
    TypeSymbolIterator(addHandler);
    Object.freeze(handlers);
    return handlers;
})();
const mapFilesList = (files,type) => {
    const set = new Object();
    const definitionBlock = new Object();

    files.forEach(file => {
        definitionBlock[file] = {
            set: value => {
                delete set[file];
                set[file] = value;
            },
            get: () => GetEntry(file,type),
            enumerable: true,
            configurable: true,
        };
    });
    Object.defineProperties(set,definitionBlock);

    const proxyHandler = proxyHandlers[type];
    const setProxy = new Proxy(set,proxyHandler);
    return setProxy;
};

function ResourceDictionary() {
    TypeNameIterator(typeName => {
        this[typeName] = new Array();
    });

    this.finalize = () => {
        TypeIterator((typeName,type) => {
            const files = this[typeName];
            this[typeName] = mapFilesList(files,type);
        });
        delete this.finalize;
        Object.freeze(this);
    };
}

const verifyContainerFile = (container,file) => {
    if(!(file in container)) FILE_NOT_IN_CONTAINER(file);
};
const verifyContainer = (target,typeName) => {
    const container = target[typeName];
    if(!container) NO_CONTAINER_OF_TYPE(type);
    return container;
};
const rewriteContainerFile = (container,file) => {
    verifyContainerFile(container,file);
    const data = container[file];
    container[file] = data;
};

const dropContainerFile = (container,file) => {
    verifyContainerFile(container,file);
    delete container[file]
};

ResourceDictionary.prototype.lock = function(file,type) {
    rewriteContainerFile(verifyContainer(this,type),file);
    return this;
}
ResourceDictionary.prototype.remove = function(file,type) {
    dropContainerFile(verifyContainer(this,type),file);
    return this;
}

TypeNameIterator(typeName => {
    const lockName = `lock${typeName}`;
    const removeName = `remove${typeName}`;
    const flatIterator = (items,method) => {
        items.flat().forEach(method);
    };
    ResourceDictionary.prototype[lockName] = function lockFiles(...files) {
        const container = this[typeName];
        flatIterator(files,file => {
            rewriteContainerFile(container,file);
        });
        return this;
    };
    ResourceDictionary.prototype[removeName] = function removeFiles(...files) {
        const container = this[typeName];
        flatIterator(files,file => dropContainerFile(container,file));
        return this;
    };
});
Object.freeze(ResourceDictionary.prototype);

export default ResourceDictionary;
