import ResourceTypes from "./resource-types.js";
import Constants from "../../internal/constants.js";
import GetLookupName from "./lookup-name.js";
const constants = Constants.Resource;

const DEFAULT_IMAGE_TYPE = constants.defaultImageType;
const DEFAULT_JSON_TYPE = constants.defaultJSONType;
const DEFAULT_TEXT_TYPE = constants.defaultTextType;
const DEFAULT_AUDIO_TYPE = constants.defaultAudioType;

const DataPrefix = constants.dataFolder;
const ImagePrefix = constants.imageFolder;
const AudioPrefix = constants.audioFolder;

const TypeLookup = Object.freeze({
    "audio": ResourceTypes.Audio,
    "text": ResourceTypes.Text,
    "binary": ResourceTypes.Binary,
    "json": ResourceTypes.JSON,
    "image": ResourceTypes.Image
});

const PrefixLookup = Object.freeze({
    [ResourceTypes.Audio]: AudioPrefix,
    [ResourceTypes.Image]: ImagePrefix,
    [ResourceTypes.JSON]: DataPrefix,
    [ResourceTypes.Text]: DataPrefix,
    [ResourceTypes.Binary]: DataPrefix
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
                case ResourceTypes.Binary:
                case ResourceTypes.Text:
                    return type;
                default:
                    throw Error(`Invalid symbolic resource type: ${type.description}`)
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

function Resource(name,type) {
    this.name = ValidateName(name);
    this.type = ValidateType(type);
    this.lookupName = GetLookupName(name);
    AddPathAppendages(this);
    Object.freeze(this);
}

export default Resource;
