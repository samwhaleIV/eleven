import Resource from "./resource-manager/resource.js";
import ResourceTypes from "./resource-manager/resource-types.js";
import GetFallbackImage from "./resource-manager/fallback-image.js";
import DecodeImageResponse from "./resource-manager/image-decode.js";

import audioContext from "../internal/audio.js";

const RESOURCE_BIND_DATA = Object.entries(ResourceTypes);

const FAILED_RESOURCE = Symbol("FailedResource");

const FALLBACK_TEXT = "Missing resource!";
const FALLBACK_IMAGE = GetFallbackImage(FALLBACK_TEXT);
const GET_FALLBACK_JSON_OBJECT = () => {return{
    message: FALLBACK_TEXT
}};
const FALLBACK_OCTET = TextToOctet(FALLBACK_TEXT);

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
function SetEntry(name,value,type) {
    return DictionaryLookup[type][name] = value;
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
    return new Promise(async resolve => {
        const resourceLoader = ResourceLoaders[resourceLink.type];
        fetch(resourceLink.name).then(response => {
            if(!response.ok) {
                throw response.statusText;
            }
            return response;
        }).then(resourceLoader).then(data => {
            if(!data) {
                throw "Invalid resource data";
            }
            SetEntry(resourceLink.lookupName,data,resourceLink.type);
            console.log(`Resource manager: Loaded '${resourceLink.name}'`);
            resolve();
        }).catch(error => {
            SetEntry(resourceLink.lookupName,FAILED_RESOURCE,resourceLink.type);
            console.error(`Resource manager: ${error} '${resourceLink.name}'`);
            resolve();
        });
    });
}

async function LoadResources(resourceLinks) {
    await Promise.all(resourceLinks.map(LoadResource));
}

function ResourceManager() {

    this.getLink = LinkResource;

    RESOURCE_BIND_DATA.forEach(type=>{
        const resourceTypeName = type[0];
        const resourceType = type[1];
        this[`get${resourceTypeName}Link`] = name => LinkResource(name,resourceType);
        this[`get${resourceTypeName}`] = name => GetEntry(name,resourceType);
        this[`has${resourceTypeName}`] = name => EntryExists(name,resourceType);
        this[`queue${resourceTypeName}`] = (...files) => {
            this.queue(...files.map(fileName => LinkResource(fileName,resourceType)
        ))};
    });

    this.loadResource = LoadResource;
    this.loadResources = LoadResources;

    const resourceQueue = [];
    this.queue = (...resourceLinks) => {
        resourceQueue.push(...resourceLinks);
    };
    this.loadQueue = () => {
        const resourceLinks = resourceQueue.splice(0);
        return LoadResources(resourceLinks);
    };

    Object.freeze(this);
    console.log("Resource manager loaded!");
}

export default Singleton({
    module: ResourceManager,
    autoInstantiate: true,
    deferInstallation: true
});
