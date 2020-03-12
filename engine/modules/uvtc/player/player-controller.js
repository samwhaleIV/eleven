import PlayerDirections from "./player-directions.js";
import PlayerInput from "./player-input.js";

const MAX_CHANGE_LIMIT = 4 / 16; //Max position change per frame
const DEFAULT_SPEED = 4; //Tiles per second

const POLARITY_LOOKUP = [];
POLARITY_LOOKUP[PlayerDirections.Up] = -1;
POLARITY_LOOKUP[PlayerDirections.Down] = 1;
POLARITY_LOOKUP[PlayerDirections.Left] = -1;
POLARITY_LOOKUP[PlayerDirections.Right] = 1;

function PlayerController(sprite,collisionLayer,tileCollision) {

    let locked = false, inputActive = false, colliding = false;

    this.lock = () => locked = true;
    this.unlock = () => locked = false;

    const getMoving = () => !locked && inputActive && !colliding;

    let pendingDirection = null;

    const trySetDirection = value => {
        if(locked) {
            pendingDirection = value;
            return;
        }
        sprite.direction = value;
    };

    const updateLocked = value => {
        locked = Boolean(value);
        if(!locked && pendingDirection) {
            if(inputActive) sprite.direction = pendingDirection;
            pendingDirection = null;
        }
    };

    Object.defineProperties(this,{
        locked: {
            get: () => locked,
            set: updateLocked,
            enumerable: true
        },
        inputActive: {
            get: () => inputActive,
            set: value => inputActive = Boolean(value),
            enumerable: true
        },
        direction: {
            get: () => sprite.direction,
            set: trySetDirection,
            enumerable: true
        }
    });
    Object.defineProperty(sprite,"moving",{
        get: getMoving,
        enumerable: true
    });

    const collides = () => {
        let result = collisionLayer.collides(sprite);
        if(!result) {
            result = tileCollision.collides(sprite);
        }
        return result;
    };

    const handlePositionUpdate = (change,direction,targetProperty,lengthProperty) => {
        const polarity = POLARITY_LOOKUP[direction];

        sprite[targetProperty] += change * polarity;
        const collisionResult = collides();

        const hitBox = sprite.hitBox || sprite;
        const hitBoxDifference = (hitBox[lengthProperty] - sprite[lengthProperty]) / 2;

        if(collisionResult) {
            colliding = true;
            let newValue = collisionResult[targetProperty];
            if(polarity < 0) {
                newValue += collisionResult[lengthProperty];
            } else {
                newValue -= sprite[lengthProperty];
            }
            newValue -= hitBoxDifference * polarity;
            sprite[targetProperty] = newValue;
        }
    };

    sprite.update = time => {
        colliding = false;
        if(locked || !inputActive) return;

        const {tilesPerSecond, direction} = sprite;

        const deltaSecond = time.delta / 1000;
        let change = tilesPerSecond * deltaSecond;

        if(change > MAX_CHANGE_LIMIT) change = MAX_CHANGE_LIMIT;

        let targetProperty, lengthProperty;

        if(direction % 2 !== 0) {
            targetProperty = "x", lengthProperty = "width";
        } else {
            targetProperty = "y", lengthProperty = "height";
        }

        handlePositionUpdate(
            change,direction,targetProperty,lengthProperty
        );
    };

    if(!sprite.tilesPerSecond) {
        sprite.tilesPerSecond = DEFAULT_SPEED;
    }
    this.sprite = sprite;

    let inputHandler = null;
    this.getInputHandler = directionImpulses => {
        if(!inputHandler) inputHandler = new PlayerInput(this,directionImpulses);
        return inputHandler;
    };

    Object.freeze(this);
}

export default PlayerController;
