import FrameHelper from "./frame.js";
import Constants from "../../internal/constants.js";

const constants = Constants.inputRoutes;

const CLICK_UP = constants.clickUp;
const CLICK_DOWN = constants.clickDown;

const ALT_CLICK_UP = constants.altClickUp;
const ALT_CLICK_DOWN = constants.altClickDown;

const POINTER_MOVE = constants.pointerMove;

const DEFAULT_CODE = 0;
const ALT_CODE = 2;

function PointerStatus(canSendEvent,sendDown,sendUp) {
    let isDown = false;
    this.send = (sendData,down) => {
        if(down) {
            if(isDown) return;
            isDown = true;
        } else {
            if(!isDown) return;
            isDown = false;
        }
        if(!canSendEvent()) return;
        if(down) {
            sendDown(sendData);
        } else {
            sendUp(sendData);
        }
    };
    Object.defineProperty(this,"isDown",{
        get: function() {
            return isDown
        }
    });
    Object.freeze(this);
}

function Mouse(canvasManager,modules) {
    const canvas = modules.internal.canvas;

    const translateLocation = (position,clientSize,size) => {
        return position / clientSize * size;
    };

    let pointerStatus = null;
    let altPointerStatus = null;

    const sendDataContainer = Object.seal({
        x: null,
        y: null,
        shiftKey: null,
        altKey: null,
        ctrlKey: null
    });

    const pointerData = Object.freeze(Object.defineProperties(new Object,{
        x: {get: function() {return sendDataContainer.x}},
        y: {get: function() {return sendDataContainer.y}},
        shiftKey: {get: function() {return sendDataContainer.shiftKey}},
        altKey: {get: function() {return sendDataContainer.altKey}},
        ctrlKey: {get: function() {return sendDataContainer.ctrlKey}},
        isDown: {get: function() {return pointerStatus.isDown}},
        altIsDown: {get: function() {return altPointerStatus.isDown}}
    }));

    const updateLocationData = sendData => {
        const container = sendDataContainer;
        container.x = sendData.x;
        container.y = sendData.y;
    };

    const getSendData = event => {
        return {
            x: translateLocation(
                event.layerX,canvas.clientWidth,canvas.width
            ),
            y: translateLocation(
                event.layerY,canvas.clientHeight,canvas.height
            ),
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        }
    };

    const getFrame = () => {
        return FrameHelper.GetDeepestFrame(canvasManager.frame);
    };

    const canSendEvent = () => {
        return !canvasManager.paused;
    };
    const hasAltEvents = frame => {
        return frame.noContextMenu || frame.altClickDown || frame.altClickUp;
    };
    const canSendAltEvent = () => {
        if(canvasManager.paused) {
            return false;
        }
        const frame = getFrame();
        if(!frame) {
            return false;
        }
        return hasAltEvents(frame);
    };

    const stopContextMenu = event => {
        event.stopPropagation();
        if(!canSendAltEvent()) return;
        event.preventDefault();  
    };

    const trySendTarget = function(targetName,data) {
        const target = getFrame()[targetName];
        if(!target) return;
        target(data);
    }
    const getTargetBind = targetName => trySendTarget.bind(null,targetName);

    const sendPointerUp = getTargetBind(CLICK_UP);
    const sendPointerDown = getTargetBind(CLICK_DOWN);
    const sendPointerUpAlt = getTargetBind(ALT_CLICK_UP);
    const sendPointerDownAlt = getTargetBind(ALT_CLICK_DOWN);
    const sendPointerMove = (function(targetBind){
        return function(sendData) {
            sendData.isDown = pointerStatus.isDown;
            sendData.altIsDown = altPointerStatus.isDown;
            targetBind(sendData);
        }
    }(getTargetBind(POINTER_MOVE)));

    pointerStatus = new PointerStatus(
        canSendEvent,sendPointerDown,sendPointerUp
    );
    altPointerStatus = new PointerStatus(
        canSendEvent,sendPointerDownAlt,sendPointerUpAlt
    );

    const getChangeTarget = event => {
        let changeTarget = null;
        if(event.button === DEFAULT_CODE) {
            changeTarget = pointerStatus.send;
        } else if(event.button === ALT_CODE) {
            changeTarget = altPointerStatus.send;
        }
        return changeTarget;
    };

    const pointerChange = function(down,event) {
        const changeTarget = getChangeTarget(event);
        if(!changeTarget) return;
        const sendData = getSendData(event);
        updateLocationData(sendData);
        if(down) sendPointerMove(sendData);
        changeTarget(sendData,down);
    };

    const pointerUp = pointerChange.bind(null,false);
    const pointerDown = pointerChange.bind(null,true);

    const pointerMove = event => {
        if(!canSendEvent()) return;
        const sendData = getSendData(event);
        updateLocationData(sendData);
        sendPointerMove(sendData);
    };

    this.installDOM = () => {
        const captureOptions = {capture: true};
        const target = canvas;
        
        target.addEventListener(
            "contextmenu",stopContextMenu,captureOptions
        );

        const preprocess = event => {
            event.stopPropagation();
            event.preventDefault();
            return event.isPrimary;
        };

        target.addEventListener("pointerup",function(event){
            if(!preprocess(event)) return;
            pointerUp(event);
        },captureOptions);

        target.addEventListener("pointerdown",function(event){
            if(!preprocess(event)) return;
            target.setPointerCapture(event.pointerId);
            pointerDown(event);
        },captureOptions);

        target.addEventListener("pointermove",function(event){
            if(!preprocess(event)) return;
            pointerMove(event);
        },captureOptions);
    };

    Object.defineProperty(canvasManager,"pointer",{
        value: pointerData,
        writable: false,
        configurable: false,
        enumerable: true
    });

    this.updateModifiers = data => {
        Object.assign(sendDataContainer,data);
    };

    Object.freeze(this);
}
export default Mouse;
