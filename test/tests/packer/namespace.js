import ElevenTest from "../../eleven-test.js";

ElevenTest.Add(function(){

    const namespaceOfNamespace = Namespace;

    const testNamespace = namespaceOfNamespace.get("ElevenTest");
    const elevenNamespace = namespaceOfNamespace.get("Eleven");

    ElevenTest.Assert(
        testNamespace === ElevenTest &&
        testNamespace === globalThis.ElevenTest &&
        elevenNamespace === globalThis.Eleven &&
        elevenNamespace === Eleven,
        "Different namespace retreival methods aren't resulting in the same namespaces/values"
    );

    ElevenTest.ExpectFailure(()=>{
        namespaceOfNamespace.get("Singleton")
    },"Namespace of name 'Singleton' should not exist");

    ElevenTest.ExpectFailure(()=>{
        namespaceOfNamespace.create({
            name: Symbol(),
            modules: [function nothing(){return 22}]
        });
    },"Namespace names cannot be symbols");

    ElevenTest.ExpectFailure(()=>{
        namespaceOfNamespace.get(Symbol());
    },"Namespace names cannot be symbols");

    const testValue = Symbol("REEEEEEEEEEEEEEEEEEEEEE");

    const garbageNamespaceName = "dfsfsfsdfsdfsdfsdkfkskakkasd";
    let garbageNamespace = namespaceOfNamespace.create({
        name: garbageNamespaceName,
        modules: [function nothingToSeeHereMoveAlong() {
            return testValue;
        }]
    });

    garbageNamespace = namespaceOfNamespace.get(garbageNamespaceName);

    if(garbageNamespace.nothingToSeeHereMoveAlong() !== testValue) {
        throw Error(`Garbage namespace return unexpected value`);
    }

    namespaceOfNamespace.makeGlobal(garbageNamespace);

    ElevenTest.ExpectFailure(()=>{
        namespaceOfNamespace.makeGlobal(namespaceOfNamespace);
    },`Default namespace 'Namespace' cannot be made global, it always should be`);

    const list = namespaceOfNamespace.list();
    if(list.length !== 3) {
        throw Error(`Expected 3 namespaces at this time, got ${list.length}`);
    }

    if(typeof globalThis.dfsfsfsdfsdfsdfsdkfkskakkasd.nothingToSeeHereMoveAlong !== "function") {
        throw Error(`Failure to make a global namespace correctly`);
    }

},"packer/namespace.js");
