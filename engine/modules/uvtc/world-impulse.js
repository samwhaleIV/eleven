import PlayerDirections from "./player/player-directions.js";

const IMPULSE_BOX_SIZE = 0.25;

const getImpulseObject = source => {
    let {x, y, direction, width, height} = source;
    
    switch(direction) {
        case PlayerDirections.Up:
        case PlayerDirections.Down: {
            const xCenter = x + width / 2 - IMPULSE_BOX_SIZE / 2;
            const boxY = direction === PlayerDirections.Up ? y - IMPULSE_BOX_SIZE : y + height;
            return {x:xCenter,y:boxY,width:IMPULSE_BOX_SIZE,height:IMPULSE_BOX_SIZE};
        };

        case PlayerDirections.Left:
        case PlayerDirections.Right: {
            const yCenter = y + height / 2 - IMPULSE_BOX_SIZE / 2;
            const boxX = direction === PlayerDirections.Left ? x - IMPULSE_BOX_SIZE : x + width;
            return {x:boxX,y:yCenter,width:IMPULSE_BOX_SIZE,height:IMPULSE_BOX_SIZE};
        };
    }
};

const getTileHandler = (source,data) => result => {
    let didHandle = false;
    if(data && data.tileHandler) {
        didHandle = data.tileHandler(result);
    }
    if(!didHandle && source.tileHandler) {
        source.tileHandler(result);
    }
};
const getLayerHandler = (source,data) => result => {
    let didHandle = false;
    if(data && data.layerHandler) {
        didHandle = data.layerHandler(result);
    }
    if(!didHandle && this.tileHandler) {
        source.tileHandler(result);
    }
};

function WorldImpulse(source,collisionLayer,tileCollision) {

    this.layerHandler = null;
    this.tileHandler = null;

    this.source = source; source = null;

    const impulse = (tileHandler,layerHandler) => {
        const object = getImpulseObject(this.source);
        let result = collisionLayer.collides(object);

        if(!result) {
            result = tileCollision.collides(object);
            if(result && tileHandler) {
                tileHandler(result);
            }
        } else if(layerHandler) {
            layerHandler(result);
        }

        return result;
    };
    this.impulse = data => {
        const tileHandler = getTileHandler(this,data);
        const layerHandler = getLayerHandler(this,data);
        impulse(tileHandler,layerHandler);
    };
    Object.seal(this);
}
export default WorldImpulse;
