Eleven.CanvasManager.markLoaded();

const FALLBACK_PASSED_MESSAGE = "Passed!";
const FALLBACK_FAILED_MESSAGE = "Failed!";

const TEST_RESULT_CLASS = "test-result";
const FAILED_RESULT_CLASS = TEST_RESULT_CLASS + " failed";
const PASSED_RESULT_CLASS = TEST_RESULT_CLASS + " passed";

const tests = new Array();

function Add(test,name) {
    if(!name) name = `Test #${test.length+1}`;
    const testObject = {test,name};
    tests.push(testObject);
}
function Assert(condition,errorMessage,invert) {
    if((invert && condition) || (!invert && !condition)) throw Error(errorMessage);
}
function ExpectFailure(test,errorMessage) {
    let passed = false;
    try {
        test();
    } catch {
        passed = true;
    }
    if(!passed) {
        throw Error(errorMessage);
    }
}
function Clear() {
    test.splice(0);
}
function Execute() {
    RunTests();
}

const testResultContainer = document.getElementById("test-results");

function addResult(message,name,testPassed) {
    let resultClass;
    if(testPassed === true) {
        if(!message) message = FALLBACK_PASSED_MESSAGE;
        resultClass = PASSED_RESULT_CLASS;
    } else if(testPassed === false) {
        if(!message) message = FALLBACK_FAILED_MESSAGE;
        resultClass = FAILED_RESULT_CLASS;
    } else {
        if(!message) message = undefined;
        resultClass = TEST_RESULT_CLASS;
    }
    if(!message) {
        message = testPassed ? FALLBACK_PASSED_MESSAGE : FALLBACK_FAILED_MESSAGE;
    }
    const result = document.createElement("div");
    result.className = resultClass;
    testResultContainer.appendChild(result);
    const resultParagraph = document.createElement("p");
    const boldTitle = document.createElement("b");
    boldTitle.appendChild(document.createTextNode(name));
    resultParagraph.appendChild(boldTitle);
    resultParagraph.appendChild(document.createTextNode(` ${message}`));
    result.appendChild(resultParagraph);
}

async function RunTest({test,name}) {
    let passed = false;
    let message = null;
    try {
        const result = await test();
        if(result) {
            message = result;
            console.log(`${name}: ${message}`);
        }
        passed = true;
    } catch(error) {
        console.error(error);
        message = error;
    }
    addResult(message,name,passed);
    return passed;
}

async function RunTests(output) {
    const testCount = tests.length;
    const passed = 0;
    for(let i = 0;i<testCount;i++) {
        let passed = await RunTest(tests[i]);
        if(passed) passed++;
    }
    if(!output) return;
    const outputMessage = `${passed} out of ${testCount} test${testCount!=1?"s":""} passed.`;
    addResult(outputMessage,"Results",null);
    console.log(outputMessage);
}
const ElevenTest = Namespace.create({
    name: "ElevenTest", modules: [Add,Clear,Execute,ExpectFailure,Assert]
});
Namespace.makeGlobal(ElevenTest);

export default ElevenTest;
