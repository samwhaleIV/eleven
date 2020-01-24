const Constants = Object.freeze({
    EngineNamespace: "Eleven",
    CSSLoadedClass: "loaded",

    Resource: Object.freeze({
        defaultImageType: ".png",
        defaultJSONType: ".json",
        defaultTextType: ".txt",
        defaultAudioType: ".ogg",
    
        dataFolder: "resources/data/",
        imageFolder: "resources/images/",
        audioFolder: "resources/audio/",
    }),

    ManagedGamepadSettings: Object.freeze({
        whitelist: false,
        triggerThreshold: 0.1,
        repeatButtons: false,
        repeatAxes: false,
        repeatTriggers: false,
        repeatDelay: 200,
        repeatRate: 100,
        axisDeadzone: 0.7,
        manageLeftAxis: true,
        manageRightAxis: false,
        compositeLeftAxis: true,
        compositeRightAxis: false
    }),

    InputRoutes: Object.freeze({
        clickDown: "clickDown",
        clickUp: "clickUp",
        altClickDown: "altClickDown",
        altClickUp: "altClickUp",
    
        pointerMove: "pointerMove",
    
        keyUp: "keyUp",
        keyDown: "keyDown",
        input: "input",
        inputGamepad: "inputGamepad",
        modifierChanged: "modifierChanged"
    })
});
export default Constants;
