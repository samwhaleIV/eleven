function GetLookupName(name) {
    const splitName = name.split(".");
    if(splitName.length === 1) {
        return name;
    } else {
        return splitName.slice(0,-1).join(".");
    }
}
export default GetLookupName;
