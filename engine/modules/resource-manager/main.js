import Resource from "./resource.js";
import ResourceTypes from "./resource-types.js";
import GetFallbackImage from "./fallback-image.js";
import DecodeImageResponse from "./image-decode.js";
import audioContext from "../../internal/audio-context.js";
import { TextToOctet } from "../../internal/octet-helper.js";

const TypeIterator = (()=>{
    const types = Object.freeze(Object.entries(ResourceTypes));
    return method => {
        types.forEach(([typeName,type]) => method(typeName,type));
    };
})();

const TYPE_SYMBOLS = Object.freeze(Object.values(ResourceTypes));
const TYPE_NAMES = Object.freeze(Object.keys(ResourceTypes));

const FAILED_RESOURCE = Symbol("FailedResource");
const LOG_NAME = "Resource manager";

const FALLBACK_TEXT = "Missing resource!";
const FALLBACK_IMAGE = GetFallbackImage(FALLBACK_TEXT);
const GET_FALLBACK_JSON_OBJECT = () => {
    return {message: FALLBACK_TEXT};
};
const FALLBACK_OCTET = TextToOctet(FALLBACK_TEXT);

const USE_NULL_RETRIEVAL_WARNING = false;
const NULL_RETRIEVAL_WARNING = (name,type) => {
    const typeName = type.description;
    console.warn(`'${name}' is not present in cache for '${typeName}'`);
};

const INVALID_RESOURCE_DATA = () => {
    throw "Invalid resource data!";
};
const BUCKET_IS_NOT_ARRAY = (name,value) => {
    throw Error(`Manifest bucket '${name}' must be an array, not $'${value}'!`);
};
const INVALID_TYPE = type => {
    throw Error(`Type '${type}' is not a valid resource type!`);
};
const LOAD_CONCURRENCY_THREAT = () => {
    throw Error("Only one loading operation can occur at any given time. " +
    "This prevents potential concurrency bugs. Please reconsider your queue usage.");
};

const FALLBACK_AUDIO = audioContext.createBuffer(
    audioContext.destination.channelCount,
    audioContext.sampleRate,audioContext.sampleRate
);

const FallbackResources = Object.freeze(Object.defineProperty({
    [ResourceTypes.Audio]: FALLBACK_AUDIO,
    [ResourceTypes.Image]: FALLBACK_IMAGE,
    [ResourceTypes.Text]: FALLBACK_TEXT,
    [ResourceTypes.Octet]: FALLBACK_OCTET},
    ResourceTypes.JSON,{get:GET_FALLBACK_JSON_OBJECT}
));

const DictionaryLookup = Object.freeze(Object.values(ResourceTypes).reduce((lookup,value)=>{
    lookup[value] = new Object();
    return lookup;
},new Object()));

function EntryExists(name,type) {
    return name in DictionaryLookup[type];
}
function SetEntry({type,lookupName},value) {
    return DictionaryLookup[type][lookupName] = value;
}
function GetEntry(name,type) {
    let entry = DictionaryLookup[type][name];
    if(!entry) {
        if(USE_NULL_RETRIEVAL_WARNING) NULL_RETRIEVAL_WARNING(name,type);
        return null;
    }
    if(entry === FAILED_RESOURCE) entry = FallbackResources[type];
    if(type === ResourceTypes.JSON) entry = entry.call();
    return entry;
}
function RemoveEntry(name,type) {
    const dictionary = DictionaryLookup[type];
    const resource = dictionary[name];
    if(!resource) {
        return false;
    }
    if(type === ResourceTypes.Image) {
        resource.close();
    }
    delete dictionary[name];
    return true;
}
function LinkResource(name,type) {
    return new Resource(name,type);
}

const ResourceLoaders = Object.freeze({
    [ResourceTypes.Audio]: response => {
        return response.arrayBuffer().then(arrayBuffer => {
            return audioContext.decodeAudioData(arrayBuffer)
        });
    },
    [ResourceTypes.Image]: DecodeImageResponse,
    [ResourceTypes.Text]: response => {
        return response.text();
    },
    [ResourceTypes.Octet]: response => {
        return response.arrayBuffer();
    },
    [ResourceTypes.JSON]: response => {
        const responseObject = response.json();
        return () => Object.assign(new Object(),responseObject);
    }
});

function LoadResource(resourceLink) {
    const {name, lookupName, type} = resourceLink;
    return new Promise(resolve => {
        const resourceLoader = ResourceLoaders[type];
        fetch(name).then(response => {
            if(!response.ok) {
                throw response.statusText;
            }
            return response;
        }).then(resourceLoader).then(data => {
            if(!data) {
                INVALID_RESOURCE_DATA();
            }
            SetEntry(resourceLink,data);
            console.log(`${LOG_NAME}: Loaded '${name}'`);
            resolve(GetEntry(lookupName,type));
        }).catch(error => {
            SetEntry(resourceLink,FAILED_RESOURCE);
            console.error(`${LOG_NAME}: ${error} '${name}'`);
            resolve(GetEntry(lookupName,type));
        });
    });
}
function LoadResources(resourceLinks) {
    return Promise.all(resourceLinks.map(LoadResource));
}

function ResourceDictionary() {
    TYPE_NAMES.forEach(typeName => {
        this[typeName] = new Array();
    });
}
(removeEntry=>{
    const removeFiles = (container,files,type) => {
        files.forEach(file => {
            removeEntry(file,type);
            delete container[file];
        });
    };
    TypeIterator((typeName,type) => {
        const methodName = `remove${typeName}`;
        ResourceDictionary.prototype[methodName] = function removeFile(...files) {
            removeFiles(this[typeName],files.flat(),type);
        };
    });
    Object.freeze(ResourceDictionary.prototype);
})(RemoveEntry);

const mapFilesList = (removeEntry=>{
    const getProxyHandler = (mappedProperties,type) => {
        return {    
            deleteProperty(target,property) {
                if(property in mappedProperties) {
                    removeEntry(property,type);
                    delete mappedProperties[property];
                }
                const canDelete = property in target;
                if(canDelete) delete target[property];
                return canDelete;
            }
        };
    };
    return (files,type) => {
        const set = new Object();
        const mappedProperties = new Object();
    
        const definitionBlock = new Object();
        files.forEach(file => {
            mappedProperties[file] = true;
            definitionBlock[file] = {
                set: value => {
                    set[file] = value;
                    delete mappedProperties[file];
                },
                get: () => GetEntry(file,type),
                enumerable: true,
                configurable: true,
            };
        });
        Object.defineProperties(set,definitionBlock);

        const proxyHandler = getProxyHandler(mappedProperties,type);
        const setProxy = new Proxy(set,proxyHandler);
        return setProxy;
    };
})(RemoveEntry);

function ResourceManager() {
    const resourceQueue = [];
    const queue = (...resourceLinks) => {
        resourceLinks = resourceLinks.flat();
        resourceQueue.push(...resourceLinks);
        return this;
    };

    this.load = (()=>{
        const getLoadList = (resourceLinks,overwrite) => {
            const loadList = {};
            resourceLinks.forEach(resourceLink => {
                const {name,lookupName,type} = resourceLink;
        
                let oldEntry = GetEntry(lookupName,type);
                if(oldEntry === FAILED_RESOURCE) {
                    oldEntry = false;
                }
                let pass = false;
        
                if(oldEntry && overwrite) {
                    if(overwrite) pass = true;
                } else {
                    pass = true;
                }
        
                if(pass) {
                    loadList[name] = resourceLink;
                }
            });
            return Object.values(loadList);
        };
        let loadLock = false;
        return async (overwrite=false) => {
            if(loadLock) LOAD_CONCURRENCY_THREAT();
            loadLock = true;
            if(!resourceQueue.length) return;
            const resourceLinks = resourceQueue.splice(0);
            const loadList = getLoadList(resourceLinks,overwrite);
            if(!loadList.length) return;
            const resources = await LoadResources(loadList);
            loadLock = false;
            return resources;
        };
    })();

    const queueLinkers = (()=>{
        const getQueueLinker = type => {
            return files => {
                if(!Array.isArray(files)) return LinkResource(files,type);
                return files.map(file => {
                    return LinkResource(file,type);
                });
            };
        };
        const linkers = new Object();
        const addLinker = type => {
            linkers[type] = getQueueLinker(type);
        };
        TYPE_SYMBOLS.forEach(addLinker);

        Object.freeze(linkers);
        return linkers;
    })();

    /* Dynamic cache methods */ (()=>{
        const validateDynamicType = type => {
            if(type in ResourceTypes) return ResourceTypes[type];
            INVALID_TYPE(type);
        };
        this.get = (file,type) => {
            return GetEntry(file,validateDynamicType(type));
        };
        this.remove = (file,type) => {
            return RemoveEntry(file,validateDynamicType(type));
        };
        this.has = (file,type) => {
            return EntryExists(file,validateDynamicType(type));
        };
        this.queue = (file,type) => {
            const dynamicType = validateDynamicType(type);
            const queueLinker = queueLinkers[dynamicType];
            return queue(queueLinker(file));
        };
    })();

    /* Static cache methods */ TypeIterator((typeName,type) =>  {
        this[`get${typeName}`] = file => {
            return GetEntry(file,type);
        };
        this[`remove${typeName}`] = file => {
            return RemoveEntry(file,type);
        };
        this[`has${typeName}`] = file => {
            return EntryExists(file,type);
        };
        const queueLinker = queueLinkers[type];
        this[`queue${typeName}`] = (...files) => {
            files = queueLinker(files.flat());
            return queue(...files);
        };
    });

    this.queueJSON = json => {
        const data = JSON.parse(json);
        const resourceLinks = new Array();
        TypeIterator((typeName,type) => {
            if(!(typeName in data)) return;
            const files = data[typeName];
            if(!Array.isArray(files)) BUCKET_IS_NOT_ARRAY(typeName,files);
            files.forEach(file=>{
                resourceLinks.push(LinkResource(file,type))
            });
        });
        if(!resourceLinks.length) return;
        return queue(resourceLinks);
    };
    this.loadWithDictionary = async (overwrite=false) => {
        const dictionary = new ResourceDictionary();
        resourceQueue.forEach(resourceLink => {
            const {lookupName, type} = resourceLink;
            const typeName = type.description;
            dictionary[typeName].push(lookupName);
        });
        await this.load(overwrite);
        TypeIterator((typeName,type) => {
            const files = dictionary[typeName];
            dictionary[typeName] = mapFilesList(files,type);
        });
        Object.freeze(dictionary);
        return dictionary;
    };
    Object.freeze(this);
}

export default ResourceManager;
