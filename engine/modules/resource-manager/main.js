import Resource from "./resource.js";
import {ResourceTypes, TypeIterator, TypeSymbolIterator} from "./resource-types.js";
import ResourceDictionary from "./resource-dictionary.js";
import CacheController from "./cache-controller.js";
import GetLoader from "./loader.js";

const GetEntry = CacheController.get;
const EntryExists = CacheController.has;
const RemoveEntry = CacheController.remove;

const BUCKET_IS_NOT_ARRAY = (name,value) => {
    throw Error(`Manifest bucket '${name}' must be an array, not $'${value}'!`);
};
const INVALID_TYPE = type => {
    throw Error(`Type '${type}' is not a valid resource type!`);
};

function ResourceManager() {
    const linkResource = (name,type) => {
        return new Resource(name,type);
    };

    const resourceQueue = new Array();

    const queue = (...resourceLinks) => {
        resourceLinks = resourceLinks.flat();
        resourceQueue.push(...resourceLinks);
        return this;
    };

    this.load = GetLoader(resourceQueue);

    const queueLinkers = (()=>{
        const getQueueLinker = type => {
            return files => {
                if(!Array.isArray(files)) {
                    return linkResource(files,type);
                }
                return files.map(file => {
                    return linkResource(file,type);
                });
            };
        };
        const linkers = new Object();
        const addLinker = type => {
            linkers[type] = getQueueLinker(type);
        };
        TypeSymbolIterator(addLinker);
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

        let linkType = null;
        const addLink = file => {
            resourceQueue.push(linkResource(file,linkType));
        };

        TypeIterator((typeName,type) => {
            if(!(typeName in data)) return;
            const files = data[typeName];
            if(!Array.isArray(files)) BUCKET_IS_NOT_ARRAY(typeName,files);
            
            linkType = type;files.forEach(addLink);
        });
        return this;
    };
    this.loadWithDictionary = async (overwrite=false) => {
        const dictionary = new ResourceDictionary();
        resourceQueue.forEach(resourceLink => {
            const {lookupName, type} = resourceLink;
            const typeName = type.description;
            dictionary[typeName].push(lookupName);
        });
        await this.load(overwrite);
        dictionary.finalize();
        return dictionary;
    };
    Object.freeze(this);
}

export default ResourceManager;
