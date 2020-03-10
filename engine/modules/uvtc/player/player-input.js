import Constants from "../../../internal/constants.js";
import PlayerDirections from "./player-directions.js";

const inputRoutes = Constants.InputRoutes;
const KEY_DOWN = inputRoutes.keyDown;
const KEY_UP = inputRoutes.keyUp;

function PlayerInput(playerController,directionImpulses) {
    const inputStack = new Array();

    const directionLookup = {
        up: PlayerDirections.Up,
        down: PlayerDirections.Down,
        left: PlayerDirections.Left,
        right: PlayerDirections.Right
    };

    const pullFromStack = code => {
        const stack = inputStack.splice(0);
        for(let i = 0;i<stack.length;i++) {
            const stackValue = stack[i];
            if(stackValue.code === code) continue;
            inputStack.push(stackValue);
        }
    };
    const placeOnStack = (code,direction) => {
        inputStack.push({code,direction});
    };

    const setMoving = () => {
        playerController.moving = true;
    };
    const setNotMoving = () => {
        playerController.moving = false;
    };

    const updateDirection = () => {
        playerController.direction = inputStack[inputStack.length-1].direction;
    };

    const repeatFilter = target => event => {
        if(event.repeat) return; target(event);
    };

    const translateImpulse = target => {
        return ({impulse,code}) => {
            if(!(impulse in directionImpulses)) return;
            target(code,directionLookup[directionImpulses[impulse]]);
        };
    };

    this[KEY_DOWN] = repeatFilter(translateImpulse((code,direction) => {
        setMoving();
        pullFromStack(code);
        placeOnStack(code,direction);
        updateDirection();
    }));
    this[KEY_UP] = translateImpulse(code => {
        pullFromStack(code);
        if(inputStack.length >= 1) {
            updateDirection();
        } else {
            setNotMoving();
        }
    });

    Object.freeze(this);
}

export default PlayerInput;
