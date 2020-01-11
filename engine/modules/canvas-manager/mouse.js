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
        return Math.floor(position / clientSize * size);
    };

    let pointerStatus = null;
    let altPointerStatus = null;

    const sendDataContainer = Object.seal({
        x: null,
        y: null,
        altKey: null,
        shiftKey: null,
        ctrlKey: null
    });

    const pointerData = Object.freeze(Object.defineProperties(new Object,{
        x: {get: function() {return sendDataContainer.x}},
        y: {get: function() {return sendDataContainer.y}},
        ctrlKey: {get: function() {return sendDataContainer.ctrlKey}},
        altKey: {get: function() {return sendDataContainer.altKey}},
        shiftKey: {get: function() {return sendDataContainer.shiftKey}},
        down: {get: function() {return pointerStatus.isDown}},
        altDown: {get: function() {return altPointerIsDown.isDown}}
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

    const tryPreventContextMenu = event => {
        if(!canSendAltEvent()) return;
        event.stopPropagation();
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
    const sendPointerMove = getTargetBind(POINTER_MOVE);

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
        event.stopPropagation();
        if(!event.isPrimary) return;
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
        event.stopPropagation();
        if(!event.isPrimary) return;
        if(!canSendEvent()) return;
        const sendData = getSendData(event);
        updateLocationData(sendData);
        sendPointerMove(sendData);
    };
    const pointerLeave = event => {
        event.stopPropagation();
        if(!event.isPrimary) return;

        const pointerIsDown = pointerStatus.isDown;
        const altPointerIsDown = altPointerStatus.isDown;
    
        if(pointerIsDown || altPointerIsDown) {
            const sendData = getSendData(event);
            if(pointerIsDown) {
                pointerStatus.send(sendData,false);
            }
            if(altPointerIsDown) {
                altPointerStatus.send(sendData,false);
            }
        }
    };

    this.installDOM = () => {
        const captureOptions = {
            capture: true
        };

        document.body.addEventListener(
            "contextmenu",tryPreventContextMenu,captureOptions
        );

        const target = canvas;

        target.addEventListener("pointerup",pointerUp,captureOptions);
        target.addEventListener("pointerdown",pointerDown,captureOptions);

        target.addEventListener("pointermove",pointerMove,captureOptions);
        target.addEventListener("pointerleave",pointerLeave,captureOptions);
    };

    Object.defineProperty(canvasManager,"pointer",{
        value: pointerData,
        writable: false,
        configurable: false,
        enumerable: false
    });

    this.updateModifiers = data => {
        sendDataContainer.altKey = data.alt;
        sendDataContainer.ctrlKey = data.ctrl;
        sendDataContainer.shiftKey = data.shift;
    };

    Object.freeze(this);
}
export default Mouse;
