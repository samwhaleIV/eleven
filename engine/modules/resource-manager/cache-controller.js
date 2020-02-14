import ResourceTypes from "./resource-types.js";
import FallbackResources from "./fallback-resources.js";
const FAILED_RESOURCE = FallbackResources.FailedResource;

const USE_NULL_RETRIEVAL_WARNING = false;
const NULL_RETRIEVAL_WARNING = (name,type) => {
    const typeName = type.description;
    console.warn(`'${name}' is not present in cache for '${typeName}'`);
};

const DictionaryLookup = Object.freeze(Object.values(ResourceTypes).reduce((lookup,value)=>{
    lookup[value] = new Object();
    return lookup;
},new Object()));

function EntryExists(name,type) {
    return name in DictionaryLookup[type];
}
function SetEntry({type,lookupName},value) {
    const dictionary = DictionaryLookup[type];
    if(EntryExists(lookupName,type)) {
        RemoveEntry(lookupName,type);
    }
    dictionary[lookupName] = value;
    return value;
}
function GetEntry(name,type) {
    let entry = DictionaryLookup[type][name];
    if(!EntryExists(name,type)) {
        if(USE_NULL_RETRIEVAL_WARNING) NULL_RETRIEVAL_WARNING(name,type);
        return null;
    }
    if(entry === FAILED_RESOURCE) entry = FallbackResources[type];
    if(type === ResourceTypes.JSON) entry = JSON.parse(entry);
    return entry;
}
function RemoveEntry(name,type) {
    const dictionary = DictionaryLookup[type];
    if(!EntryExists(name,type)) {
        return false;
    }
    const resource = dictionary[name];
    if(type === ResourceTypes.Image) {
        resource.close();
    }
    delete dictionary[name];
    return true;
}

const CacheController = Object.freeze({
    get: GetEntry,
    set: SetEntry,
    has: EntryExists,
    remove: RemoveEntry
});
export default CacheController;
