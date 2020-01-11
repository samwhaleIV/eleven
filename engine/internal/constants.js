const Constants = Object.freeze({
    engineNamespace: "Eleven",

    resource: Object.freeze({
        defaultImageType: ".png",
        defaultJSONType: ".json",
        defaultTextType: ".txt",
        defaultAudioType: ".ogg",
    
        dataFolder: "resources/data/",
        imageFolder: "resources/images/",
        audioFolder: "resources/audio/",
    }),

    inputRoutes: Object.freeze({
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
