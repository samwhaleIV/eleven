import Resource from "./resource.js";
import ResourceTypes from "./resource-types.js";
import GetFallbackImage from "./fallback-image.js";
import DecodeImageResponse from "./image-decode.js";
import audioContext from "../../internal/audio-context.js";

const RESOURCE_BIND_DATA = Object.entries(ResourceTypes);

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
    if(!entry || entry === FAILED_RESOURCE) {
        entry = FallbackResources[type];
    }
    if(type === ResourceTypes.JSON) {
        entry = entry.call();
    }
    return entry;
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
    const {name, type} = resourceLink;
    return new Promise(async resolve => {
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
            resolve();
        }).catch(error => {
            SetEntry(resourceLink,FAILED_RESOURCE);
            console.error(`${LOG_NAME}: ${error} '${name}'`);
            resolve();
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
            resourceLookup[name] = resourceLink;
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

    RESOURCE_BIND_DATA.forEach(([
        typeName,type
    ]) => {
        this[`get${typeName}Link`] = file => {
            return LinkResource(file,type);
        };
        this[`get${typeName}`] = name => {
            return GetEntry(name,type);
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

    Object.freeze(this);
}

export default ResourceManager;
