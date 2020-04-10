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
        let tileHandler, layerHandler;
        if(data) {
            tileHandler = data.tileHandler;
            layerHandler = data.layerHandler;
        }
        if(tileHandler || layerHandler) {
            return impulse(tileHandler,layerHandler);
        } else {
            return impulse(this.tileHandler,this.layerHandler);
        }
    }
    Object.seal(this);
}
export default WorldImpulse;
