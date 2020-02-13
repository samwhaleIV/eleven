const ResourceTypes = Object.freeze([
    "Image","JSON","Text","Audio","Octet"
].reduce((set,typeName) => {
    set[typeName] = Symbol(typeName);
    return set;
},new Object()));

export default ResourceTypes;
