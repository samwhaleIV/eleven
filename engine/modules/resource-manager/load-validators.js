import ResourceTypes from "./resource-types.js";
import FallbackResources from "./fallback-resources.js";

const validateStringTag = (object,tag) => {
    const tagValue = object[Symbol.toStringTag];
    if(tagValue !== tag) {
        throw Error(`Value must be an '${tag}'. String tag '${tagValue}' does not match`);
    }
};
const validatePrototype = (value,resourceType) => {
    const valuePrototype = Object.getPrototypeOf(value);
    const targetPrototype = Object.getPrototypeOf(FallbackResources[resourceType]);
    if(valuePrototype !== targetPrototype) {
        throw Error("Value is not of correct type for target container");
    }
}
const validateType = (value,type,stringTag) => {
    if(stringTag) validateStringTag(value,stringTag);
    validatePrototype(value,type);
};

const LoadValidators = Object.freeze({
    [ResourceTypes.Audio]: value => {
        validateType(value,ResourceTypes.Audio,"AudioBuffer");
        if(!("buffer" in value)) {
            Object.defineProperty(value,"buffer",{value:value});
        }
    },
    [ResourceTypes.Image]: value => {
        validateType(value,ResourceTypes.Image,"ImageBitmap");
    },
    [ResourceTypes.JSON]: value => {
        if(typeof value !== "string") {
            throw Error("Value must be of type string and contain valid JSON data");
        }
        JSON.parse(value);
    },
    [ResourceTypes.Text]: value => {
        if(typeof value !== "string") {
            throw Error("Invalid text resource. Must be of type string.");
        }
    },
    [ResourceTypes.Binary]: value => {
        validateType(value,ResourceTypes.Binary,"ArrayBuffer");
    }
});

export default LoadValidators;
