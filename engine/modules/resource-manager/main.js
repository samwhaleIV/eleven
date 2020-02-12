import Resource from "./resource.js";
import ResourceTypes from "./resource-types.js";
import GetFallbackImage from "./fallback-image.js";
import DecodeImageResponse from "./image-decode.js";
import audioContext from "../../internal/audio-context.js";

const TYPES = Object.entries(ResourceTypes);
const TYPE_NAMES = TYPES.reduce((set,[name,symbol])=>{
    set[symbol] = name; return set;
},new Object());

const FAILED_RESOURCE = Symbol("FailedResource");
const LOG_NAME = "Resource manager";

const FALLBACK_TEXT = "Missing resource!";
const FALLBACK_IMAGE = GetFallbackImage(FALLBACK_TEXT);
const GET_FALLBACK_JSON_OBJECT = () => {
    return {message: FALLBACK_TEXT};
};
const FALLBACK_OCTET = TextToOctet(FALLBACK_TEXT);

const INVALID_RESOURCE_DATA = () => {
    throw "Invalid resource data";
};
const BUCKET_IS_NOT_ARRAY = (name,value) => {
    throw Error(`Manifest bucket '${name}' must be an array, not $'${value}'!`);
};

const FALLBACK_AUDIO = audioContext.createBuffer(
    audioContext.destination.channelCount,
    audioContext.sampleRate,audioContext.sampleRate
);

function TextToOctet(string) {
    return new TextEncoder().encode(string);
}

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
        return null;
    }
    if(entry === FAILED_RESOURCE) {
        entry = FallbackResources[type];
    }
    if(type === ResourceTypes.JSON) {
        entry = entry.call();
    }
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

function LoadResources(resourceLinks,overwrite) {
    return Promise.all(resourceLinks.map(LoadResource));
}

function getLoadList(resourceLinks,overwrite) {
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
}

function ResourceManager() {

    const resourceQueue = [];
    this.getLink = LinkResource;
    this.queue = (...resourceLinks) => {
        resourceLinks = resourceLinks.flat();
        resourceQueue.push(...resourceLinks);
        return this;
    };
    this.load = (overwrite=false) => {
        if(!resourceQueue.length) return;
        const resourceLinks = resourceQueue.splice(0);
        const loadList = getLoadList(resourceLinks,overwrite);
        if(!loadList.length) return;
        return LoadResources(loadList);
    };

    TYPES.forEach(([
        typeName,type
    ]) => {
        this[`get${typeName}Link`] = file => {
            return LinkResource(file,type);
        };
        this[`get${typeName}`] = name => {
            return GetEntry(name,type);
        };
        this[`remove${typeName}`] = name => {
            return RemoveEntry(name,type);
        };
        this[`has${typeName}`] = name => {
            return EntryExists(name,type);
        };
        this[`queue${typeName}`] = (...files) => {
            files = files.flat().map(fileName => {
                return LinkResource(fileName,type);
            });
            return this.queue(...files);
        };
    });

    this.queueJSON = json => {
        const data = JSON.parse(json);
        const resourceLinks = new Array();
        TYPES.forEach(([typeName,type]) => {
            if(!(typeName in data)) return;
            const files = data[typeName];
            if(!Array.isArray(files)) BUCKET_IS_NOT_ARRAY(typeName,files);
            files.forEach(file=>{
                resourceLinks.push(LinkResource(file,type))
            });
        });
        if(!resourceLinks.length) return;
        this.queue(resourceLinks);
        return this;
    };

    const mapFilesList = (files,type) => {
        return files.reduce((set,value)=>{
            set[value] = GetEntry(value,type);
            return set;
        },new Object());
    };

    this.loadWithDictionary = async (overwrite=false) => {
        const dictionary = new Object();
        TYPES.forEach(([typeName,type]) => {
            dictionary[typeName] = new Array();
            dictionary[`remove${typeName}`] = (...files) => {
                files = files.flat();
                const container = dictionary[typeName];
                const removalData = files.forEach(file => {
                    RemoveEntry(file,type);
                    delete container[file];
                });
                return removalData;
            };
        });
        resourceQueue.forEach(resourceLink => {
            const {lookupName, type} = resourceLink;
            const typeName = TYPE_NAMES[type];
            dictionary[typeName].push(lookupName);
        });
        await this.load(overwrite);
        TYPES.forEach(([typeName,type]) => {
            const files = dictionary[typeName];
            dictionary[typeName] = mapFilesList(files,type);
        });
        return dictionary;
    };

    Object.freeze(this);
}

export default ResourceManager;
