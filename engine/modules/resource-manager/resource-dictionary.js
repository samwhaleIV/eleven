import {TypeIterator, TypeNameIterator} from "./resource-types.js";
import CacheController from "./cache-controller.js";

const GetEntry = CacheController.get;

const mapFilesList = (files,type) => {
    const set = new Object();

    files.forEach(file => {
        set[file] = GetEntry(file,type);
    });

    return set;
};

function ResourceDictionary() {
    TypeNameIterator(typeName => {
        this[typeName] = new Array();
    });

    this.finalize = () => {
        TypeIterator((typeName,type) => {
            const files = this[typeName];
            this[typeName] = mapFilesList(files,type);
        });
        delete this.finalize;
        Object.freeze(this);
    };
}

export default ResourceDictionary;
