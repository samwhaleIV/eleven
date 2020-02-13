const TYPE_SYMBOLS = new Array();
const TYPE_NAMES = new Array();

const ResourceTypes = Object.freeze([
    "Image","JSON","Text","Audio","Octet"
].reduce((set,typeName) => {
    const symbol = Symbol(typeName);
    set[typeName] = symbol;
    TYPE_NAMES.push(typeName);
    TYPE_SYMBOLS.push(symbol);
    return set;
},new Object()));

const TypeIterator = (()=>{
    const types = Object.entries(ResourceTypes);
    return method => {
        types.forEach(([typeName,type]) => method(typeName,type));
    };
})();

const TypeNameIterator = method => {
    TYPE_NAMES.forEach(method);
};
const TypeSymbolIterator = method => {
    TYPE_SYMBOLS.forEach(method);
};

export default ResourceTypes;
export {ResourceTypes, TypeIterator, TypeNameIterator, TypeSymbolIterator}
