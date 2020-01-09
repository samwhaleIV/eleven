import ResourceTypes from "./resource-types.js";
import Constants from "../../internal/constants.js";

const DEFAULT_IMAGE_TYPE = Constants.defaultImageType;
const DEFAULT_JSON_TYPE = Constants.defaultJSONType;
const DEFAULT_TEXT_TYPE = Constants.defaultTextType;
const DEFAULT_AUDIO_TYPE = Constants.defaultAudioType;

const DataPrefix = Constants.dataFolder;
const ImagePrefix = Constants.imageFolder;
const AudioPrefix = Constants.audioFolder;

const TypeLookup = Object.freeze({
    "audio": ResourceTypes.Audio,
    "text": ResourceTypes.Text,
    "octet": ResourceTypes.Octet,
    "json": ResourceTypes.JSON,
    "image": ResourceTypes.Image
});

const PrefixLookup = Object.freeze({
    [ResourceTypes.Audio]: AudioPrefix,
    [ResourceTypes.Image]: ImagePrefix,
    [ResourceTypes.JSON]: DataPrefix,
    [ResourceTypes.Text]: DataPrefix,
    [ResourceTypes.Octet]: DataPrefix
});
const SuffixLookup = Object.freeze({
    [ResourceTypes.Audio]: DEFAULT_AUDIO_TYPE,
    [ResourceTypes.Image]: DEFAULT_IMAGE_TYPE,
    [ResourceTypes.JSON]: DEFAULT_JSON_TYPE,
    [ResourceTypes.Text]: DEFAULT_TEXT_TYPE
});

function ValidateType(type) {
    const valueType = typeof type;
    switch(valueType) {
        case "string":
            break;
        case "symbol":
            switch(type) {
                case ResourceTypes.Image:
                case ResourceTypes.Audio:
                case ResourceTypes.JSON:
                case ResourceTypes.Octet:
                case ResourceTypes.Text:
                    return type;
                default:
                    throw Error(`Invalid symbolic resource type: ${type.toString()}`)
            }
        default:
            throw Error(`Resource type (${valueType}) is not of type 'string'`);
    }
    if(type in TypeLookup) {
        return TypeLookup[type];
    } else {
        throw Error(`Invalid resource type '${type}'`);
    }
}
function ValidateName(name) {
    if(typeof name !== "string") {
        throw Error("Resource name is not of type 'string'");
    }
    if(!name.length) {
        throw Error("Resource name cannot be empty!");
    }
    return name;
}
function AddPathAppendages(resource) {
    const nameHasSuffix = resource.name !== resource.lookupName;
    if(resource.type in PrefixLookup) {
        resource.name = PrefixLookup[resource.type] + resource.name;
    }
    if(!nameHasSuffix) {
        if(resource.type in SuffixLookup) {
            resource.name = resource.name + SuffixLookup[resource.type];
        }
    }
}
function GetLookupName(name) {
    const splitName = name.split(".");
    if(splitName.length === 1) {
        return name;
    } else {
        return splitName.slice(0,-1).join(".");
    }
}

function Resource(name,type) {
    this.name = ValidateName(name);
    this.type = ValidateType(type);
    this.lookupName = GetLookupName(name);
    AddPathAppendages(this);
    Object.freeze(this);
}

export default Resource;
