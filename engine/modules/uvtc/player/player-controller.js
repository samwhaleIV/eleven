import PlayerDirections from "./player-directions.js";
import PlayerInput from "./player-input.js";

const DEFAULT_SPEED = 5; //Tiles per second

const POLARITY_LOOKUP = [];
POLARITY_LOOKUP[PlayerDirections.Up] = -1;
POLARITY_LOOKUP[PlayerDirections.Down] = 1;
POLARITY_LOOKUP[PlayerDirections.Left] = -1;
POLARITY_LOOKUP[PlayerDirections.Right] = 1;

function PlayerController(sprite,collisionLayer,tileCollision) {

    let locked = false, moving = false;

    this.lock = () => locked = true;
    this.unlock = () => locked = false;

    const getMoving = () => moving;

    Object.defineProperties(this,{
        locked: {
            get: () => locked,
            set: value => locked = Boolean(value),
            enumerable: true
        },
        moving: {
            get: getMoving,
            set: value => moving = Boolean(value),
            enumerable: true
        },
        direction: {
            get: () => sprite.direction,
            set: value => sprite.direction = value,
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
        if(locked || !moving) return;

        const {tilesPerSecond, direction} = sprite;

        const deltaSecond = time.delta / 1000;
        const change = tilesPerSecond * deltaSecond;

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
