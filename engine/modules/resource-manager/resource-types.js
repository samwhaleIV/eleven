const ResourceTypes = Object.freeze([
    "Image","JSON","Text","Audio","Octet"
].reduce((set,typeName) => {
    set[typeName] = Symbol(typeName);
},new Object()));

export default ResourceTypes;
