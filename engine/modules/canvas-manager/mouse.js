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

function Mouse(canvasManager,modules) {
    const canvas = modules.internal.canvas;

    const translateLocation = (position,clientSize,size) => {
        return Math.floor(position / clientSize * size);
    };

    const getLocation = event => {
        return {
            x: translateLocation(event.layerX,canvas.clientWidth,canvas.width),
            y: translateLocation(event.layerY,canvas.clientHeight,canvas.height)
        }
    };

    const getFrame = () => {
        return FrameHelper.GetDeepestFrame(canvasManager.frame);
    };

    const canSendEvent = () => {
        return !canvasManager.paused;
    };
    const hasAltEvents = frame => {
        return frame.altClickDown || frame.altClickUp;
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

    const trySendTarget = function(targetName,location) {
        const target = getFrame()[targetName];
        if(!target) return;
        target(location.x,location.y);
    }
    const getTargetBind = targetName => trySendTarget.bind(null,targetName);

    const sendPointerUp = getTargetBind(CLICK_UP);
    const sendPointerDown = getTargetBind(CLICK_DOWN);
    const sendPointerUpAlt = getTargetBind(ALT_CLICK_UP);
    const sendPointerDownAlt = getTargetBind(ALT_CLICK_DOWN);
    const sendPointerMove = getTargetBind(POINTER_MOVE);

    const PointerStatus = function(sendDown,sendUp) {
        let isDown = false;
        const canSendEventTarget = canSendEvent;
        this.send = (location,down) => {
            if(down) {
                if(isDown) return;
                isDown = true;
            } else {
                if(!isDown) return;
                isDown = false;
            }
            if(!canSendEventTarget()) return;
            if(down) {
                sendDown(location);
            } else {
                sendUp(location);
            }
        };
        Object.defineProperty(this,"isDown",{
            get: function() {
                return isDown
            }
        });
        Object.freeze(this);
    }

    const pointerStatus = new PointerStatus(sendPointerDown,sendPointerUp);
    const altPointerStatus = new PointerStatus(sendPointerDownAlt,sendPointerUpAlt);

    const getChangeTarget = event => {
        let target = null;
        if(event.button === DEFAULT_CODE) {
            target = pointerStatus.send;
        } else if(event.button === ALT_CODE) {
            target = altPointerStatus.send;
        }
        return target;
    };

    const pointerChange = function(down,event) {
        event.stopPropagation();
        if(!event.isPrimary) return;
        const target = getChangeTarget(event);
        if(!target) return;
        target(getLocation(event),down);
    };

    const pointerUp = pointerChange.bind(null,false);
    const pointerDown = pointerChange.bind(null,true);

    const pointerMove = event => {
        event.stopPropagation();
        if(!event.isPrimary) return;
        if(!canSendEvent()) return;
        sendPointerMove(getLocation(event));
    };
    const pointerLeave = event => {
        event.stopPropagation();
        if(!event.isPrimary) return;

        const pointerIsDown = pointerStatus.isDown;
        const altPointerIsDown = altPointerStatus.isDown;
    
        if(pointerIsDown || altPointerIsDown) {
            const location = getLocation(event);
            if(pointerIsDown) {
                pointerStatus.send(location,false);
            }
            if(altPointerIsDown) {
                altPointerStatus.send(location,false);
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
}
export default Mouse;
