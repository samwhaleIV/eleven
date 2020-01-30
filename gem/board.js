//All ye who enter here abandon all hope

import Eleven from "../engine/eleven.js";
const { CanvasManager, ResourceManager } = Eleven;

const GEM_IMAGE = "gems.png";
const BOARD_ROWS = 9;
const BOARD_COLUMNS = 9;
const GEM_SIZE = 10;
const GEM_SPACE = 1;
const GEM_STRIDE = GEM_SIZE + GEM_SPACE;
const GEM_COUNT = 5;
const SELECT_START = GEM_COUNT * GEM_SIZE;

const ANIMATION_ROWS = 10;
const ANIMATION_STEP = 30;
const ANIMATION_DURATION = ANIMATION_ROWS * ANIMATION_STEP;
const MOVE_TIME = 175;
const SWAP_TIME = 250;

let moveTime = SWAP_TIME;

const RENDER_SCALE = 5;

const GEM_RENDER_SIZE = GEM_SIZE * RENDER_SCALE;

const getBoardLength = dimensionLength => {
    return ((GEM_SIZE + GEM_SPACE) * dimensionLength + GEM_SPACE) * RENDER_SCALE;
};

const BOARD_WIDTH = getBoardLength(BOARD_COLUMNS);
const BOARD_HEIGHT = getBoardLength(BOARD_ROWS);

const UP = -1;
const LEFT = -2;
const DOWN = 1;
const RIGHT = 2;

const SELECT_STATES = Object.freeze({
    Hover: 0,
    Lock: 1,
    HoverConnect: 2
});

const KEY_UP = "KeyW";
const KEY_DOWN = "KeyS";
const KEY_LEFT = "KeyA";
const KEY_RIGHT = "KeyD";
const KEY_ENTER = "Enter";
const KEY_ESCAPE = "Escape";

const getGem = type => {
    return Object.seal({
        type,x:null,y:null,
        moveDistance: null,
        moveStart: null,
        deleteStart: null,
        moveCallback: null,
        direction: null
    });
};
const getGemY = (gem,time) => {
    let gemY = 0;
    let yOffset = 0;
    if(gem.moveStart !== null) {
        if(gem.direction % 2 !== 0) {
            let delta = (time.now - gem.moveStart) / moveTime;
            if(delta > gem.moveDistance) {
                delta = gem.moveDistance;
                gem.moveCallback();
                return null;
            }
            yOffset += Math.sign(gem.direction) * GEM_STRIDE * delta;
        }
    } else if(gem.deleteStart !== null) {
        const delta = Math.max(time.now - gem.deleteStart,0);
        let animationRow = Math.floor(delta / ANIMATION_STEP);
        if(animationRow >= ANIMATION_ROWS) {
            animationRow = ANIMATION_ROWS - 1;
        }
        gemY = animationRow * GEM_SIZE;
    }
    return {gemY,yOffset};
};
const getGemX = (gem,time) => {
    let gemX = gem.type * GEM_SIZE;
    let xOffset = 0;
    if(gem.moveStart !== null) {
        if(gem.direction % 2 === 0) {
            let delta = (time.now - gem.moveStart) / moveTime;
            if(delta > gem.moveDistance) {
                delta = gem.moveDistance;
                gem.moveCallback();
                return null;
            }
            xOffset += Math.sign(gem.direction) * GEM_STRIDE * delta;
        }
    }
    return {gemX,xOffset};
};

const getCounterCallback = (callback,count=0) => {
    let invocations = 0;
    return (...parameters) => {
        if(++invocations === count) {
            callback(...parameters);
        }
    };
};

const moveGem = (gem,x,y,distance,time,callback) => {
    gem.moveDistance = distance;
    if(x) {
        gem.moveStart = time;
        gem.direction = x < 0 ? LEFT : RIGHT;
        gem.moveCallback = callback;
    } else {
        gem.moveStart = time;
        gem.direction = y < 0 ? UP : DOWN;
        gem.moveCallback = callback;
    }
};
const getRandomGemType = (()=>{
    let gemIndex = 0;
    return () => gemIndex++ % GEM_COUNT;
})();
const getRandomGem = () => getGem(getRandomGemType());
const getDynamicFillArray = (size,fill) => {
    return Object.seal(new Array(size).fill()).map(fill);
};
const getBoardRow = () => {
    return getDynamicFillArray(BOARD_COLUMNS,getRandomGem);
};
const getBoardData = () => {
    return getDynamicFillArray(BOARD_ROWS,getBoardRow);
};

function BoardData() {
    const rows = getBoardData();
    this.get = (x,y) => {
        return rows[y][x];
    };
    this.set = (x,y,value) => {
        return rows[y][x] = value;
    };

    const columns = new Array(BOARD_COLUMNS);
    for(let i = 0;i<columns.length;i++) {
        columns[i] = new Array(BOARD_ROWS);
    }
    this.rows = rows;
    this.columns = columns;

    Object.freeze(this);
    for(let y = 0;y<BOARD_ROWS;y++) {
        const row = rows[y];
        for(let x = 0;x<BOARD_COLUMNS;x++) {    
            const gem = row[x];
            gem.x = x;
            gem.y = y;
            columns[x][y] = gem;
        }
    }
}

const getSelectionState = () => {
    return Object.seal({gem:null,state:null,x:null,y:null});
};

function Board() {

    let gemImage = GEM_IMAGE;
    this.load = async () => {
        [gemImage] = await ResourceManager.queueImage([gemImage]).load();
        CanvasManager.setSize(BOARD_WIDTH,BOARD_HEIGHT);
        CanvasManager.enableBoxFill();
    };
    const boardData = new BoardData();
    Object.defineProperty(this,"boardData",{value:boardData});

    const selection = getSelectionState();
    selection.state = SELECT_STATES.Hover;
    const connection = getSelectionState();
    connection.state = SELECT_STATES.HoverConnect;

    const inBounds = (x,y) => {
        return x >= 0 && y >= 0 && y < BOARD_ROWS && x < BOARD_COLUMNS;
    };

    const moveDown = gem => {
        return new Promise(resolve =>{
            moveGem(gem,0,1,1,performance.now(),()=>{
                gem.moveStart = null;
                const newGem = boardData.get(gem.x,gem.y+1)
                newGem.type = gem.type;
                newGem.deleteStart = null;
                gem.deleteStart = -Infinity;
                resolve();
            });
        });
    };
    const dropNewGem = async gem => {
        gem.type = getRandomGemType();
        return new Promise(resolve =>{
            moveGem(gem,0,1,0,performance.now()+moveTime,()=>{
                gem.moveStart = null;
                gem.deleteStart = null;
                resolve();
            });
        });
    };

    const countEmptyTiles = () => {
        let count = 0;
        for(let y = 0;y<BOARD_ROWS;y++) {
            const row = boardData.rows[y];
            for(let x = 0;x<BOARD_COLUMNS;x++) {
                if(row[x].deleteStart) count++;
            }
        }
        return count;
    };

    const fillBoard = async () => {
        moveTime = MOVE_TIME;

/*
        Here lies the the old code that caused so much pain and damage. 1/29/2020 - 1/29/2020
        Leave an F to pay respects.

        F
*/

        const start = BOARD_ROWS - 2;
        const endRow = boardData.rows[0];
        while(countEmptyTiles()) {
            const drops = [];
            for(let y = start;y>=0;y--) {//configure
                const row = boardData.rows[y];
                for(let x = 0;x<BOARD_COLUMNS;x++) {
                    const gem = row[x];
                    if(!gem.deleteStart && boardData.get(x,y+1).deleteStart) {
                        drops.push(moveDown(gem));
                    }
                }
            }
            for(let x = 0;x<BOARD_COLUMNS;x++) {
                const gem = endRow[x];
                if(gem.deleteStart) {
                    drops.push(dropNewGem(gem));
                }
            }
            await Promise.all(drops);
        }

        moveTime = SWAP_TIME;
    };
    const getMatches = (set,length) => {
        const matches = new Array();
        const buffer = [];
        let last = set[0];
        if(!last.deleteStart) {
            buffer.push(last);
        }
        for(let i = 1;i<length;i++) {
            let gem = set[i];
            if(gem.type === last.type && !gem.deleteStart) {
                buffer.push(gem);
            } else {
                const removed = buffer.splice(0)
                if(removed.length >= 3) {
                    matches.push(...removed);
                }
                if(!gem.deleteStart) {
                    buffer.push(gem);
                }
            }
            last = gem;
        }
        if(buffer.length >= 3) {
            matches.push(...buffer.splice(0));
        }
        return matches;
    };
    const getAllMatches = () => {
        const matches = [];
        for(let y = 0;y<BOARD_ROWS;y++) {
            const row = boardData.rows[y];
            matches.push(...getMatches(row,BOARD_ROWS));
        }
        for(let x = 0;x<BOARD_COLUMNS;x++) {
            const column = boardData.columns[x];
            matches.push(...getMatches(column,BOARD_COLUMNS));
        }
        return matches;
    };
    const removeMatches = async () => {
        return new Promise(resolve => {
            const matches = getAllMatches();
            const now = performance.now();
            for(let i = 0;i<matches.length;i++) {
                matches[i].deleteStart = now;
            }
            if(!matches.length) {
                resolve(false);
            } else {
                setTimeout(resolve,ANIMATION_DURATION+100,true);
            }
        });
    };

    const getConnectionDirection = () => {
        const sourceGem = selection.gem;
        const sourceX = sourceGem.x;
        const sourceY = sourceGem.y;

        const destinationGem = connection.gem;
        const destinationX = destinationGem.x;
        const destinationY = destinationGem.y;

        const xDistance = Math.abs(sourceX - destinationX);
        const yDistance = Math.abs(sourceY - destinationY);
        if(xDistance + yDistance !== 1) return null;
        if(xDistance) {
            return destinationX < sourceX ? LEFT : RIGHT;
        } else {
            return destinationY < sourceY ? UP : DOWN;
        }
    };

    const validateDirectionSwap = direction => {
        if(direction === null) return false;
        const sourceGem = selection.gem;
        const sourceX = sourceGem.x;
        const sourceY = sourceGem.y;
        let x = sourceX, y = sourceY;
        switch(direction) {
            case UP: y--; break;
            case DOWN: y++; break;
            case LEFT: x--; break;
            case RIGHT: x++; break;
        }
        if(!inBounds(x,y)) return false;
        //add other fail conditions
        const destinationGem = boardData.get(x,y);
        //if(destinationGem.type === sourceGem.type) return false;
        if(destinationGem.deleteStart || sourceGem.deleteStart) return false;
        x -= sourceX; y -= sourceY;
        return [sourceGem,destinationGem,x,y];
    };

    const setSelectionGem = gem => {
        selection.gem = gem;
    };
    const setConnectionGem = gem => {
        connection.gem = gem;
    };

    this.pointerMove = ({x,y}) => {
        x = Math.floor(x / (BOARD_WIDTH / BOARD_COLUMNS));
        y = Math.floor(y / (BOARD_HEIGHT / BOARD_ROWS));
        if(!inBounds(x,y)) return;
        const gem = boardData.get(x,y);
        if(selection.state !== SELECT_STATES.Lock) {
            setSelectionGem(gem);
        }
        setConnectionGem(gem);
    };

    const removeConnectionGem = () => {
        setConnectionGem(null);
    };

    const shiftSelectionLock = () => {
        setSelectionGem(connection.gem);
        removeConnectionGem();
    };
    
    let inputLocked = false;

    const setSelectionLock = () => {
        selection.state = SELECT_STATES.Lock;
    };

    const setSelectionHover = () => {
        selection.state = SELECT_STATES.Hover;
    };

    const swapEndHandOff = async () => {
        while(await removeMatches()) {
            await fillBoard();
        }
        inputLocked = false;
    };

    const getSwapEnd = (sourceGem,destinationGem) => {
        return () => {

            const sourceGemType = sourceGem.type;
            sourceGem.type = destinationGem.type;
            destinationGem.type = sourceGemType;

            sourceGem.moveStart = null;
            destinationGem.moveStart = null;

            setSelectionHover();
            if(sourceGem !== connection.gem && connection.gem !== null) {
                //sets the gem to the new connection location if the hover changed during a swap
                setSelectionGem(connection.gem);
                removeConnectionGem();
            } else {
                setSelectionGem(destinationGem);
                removeConnectionGem();
            }

            swapEndHandOff();
        };
    };

    const swapGems = ([
        sourceGem,destinationGem,xChange,yChange
    ]) => {
        inputLocked = true;
        const swapEnd = getSwapEnd(sourceGem,destinationGem);
        const callback = getCounterCallback(swapEnd,2);
        const now = performance.now();
        moveGem(sourceGem,xChange,yChange,1,now,callback);
        moveGem(destinationGem,-xChange,-yChange,1,now,callback);
    };

    const tryBoardSwap = (direction=null) => {
        const evaluateDirection = direction === null;

        if(evaluateDirection) {
            direction = getConnectionDirection();
        }

        const swapData = validateDirectionSwap(direction);
        if(!swapData) {
            if(evaluateDirection) {
                shiftSelectionLock();
            }
            return;
        }

        swapGems(swapData);
    };

    const inputLocker = base => {
        return (...parameters) => {
            if(inputLocked) return;
            base(...parameters);
        };
    };
    
    const selectionIsLocked = () => {
        return selection.state === SELECT_STATES.Lock;
    };

    const selectionMatchesConnection = () => {
        return connection.gem === selection.gem;
    };

    this.clickDown = inputLocker(() => {
        if(!selectionIsLocked()) {
            setSelectionLock();
        } else {
            if(selectionMatchesConnection()) {
                setSelectionHover();
            } else {
                tryBoardSwap();
            }
        }
    });

    const tryKeyEnter = () => {
        setSelectionLock();
    };
    const tryKeyCancel = () => {
        setSelectionHover();
        removeConnectionGem();
    };

    const tryKeySwap = event => {
        let direction = null;
        switch(event.impulse) {
            case KEY_ENTER:
            case KEY_ESCAPE: tryKeyCancel(); return;
            case KEY_UP: direction = UP; break;
            case KEY_DOWN: direction = DOWN; break;
            case KEY_LEFT: direction = LEFT; break;
            case KEY_RIGHT: direction = RIGHT; break;
            default: return;
        }
        tryBoardSwap(direction);
    };
    const tryMoveFocus = event => {
        const gem = selection.gem;
        if(gem === null) {
            selection.gem = boardData.get(0,0);
            removeConnectionGem();
            return;
        }
        let x = gem.x;
        let y = gem.y;
        switch(event.impulse) {
            case KEY_ENTER: tryKeyEnter(); return;
            case KEY_UP: y--; break;
            case KEY_DOWN: y++; break;
            case KEY_LEFT: x--; break;
            case KEY_RIGHT: x++; break;
            default: return;
        }
        if(!inBounds(x,y)) return;

        const changeX = x - gem.x;
        const changeY = y - gem.y;
        let selectionGem = boardData.get(x,y);
        while(selectionGem.deleteStart) {
            x += changeX; y += changeY;
            if(!inBounds(x,y)) return;
            selectionGem = boardData.get(x,y);
        }
        selection.gem = selectionGem;

        removeConnectionGem();
    };

    this.keyDown = inputLocker(event => {
        if(selectionIsLocked()) {
            tryKeySwap(event);
        } else {
            tryMoveFocus(event);
        }
    });

    this.resize = context => {
        context.imageSmoothingEnabled = false;
        context.fillStyle = "white";
    };

    const gemData = boardData.rows;

    this.render = (context,size,time) => {
        context.fillRect(0,0,size.width,size.height);

        let restart = false;
        
        for(let y = 0;y<BOARD_ROWS;y++) {
            const row = gemData[y];
            for(let x = 0;x<BOARD_COLUMNS;x++) {    
                const gem = row[x];

                const gemXData = getGemX(gem,time);
                const gemYData = getGemY(gem,time);

                if(restart) continue;

                if(!gemXData || !gemYData) {
                    restart = true;
                    continue;
                }
    
                let {gemX, xOffset} = gemXData;
                let {gemY, yOffset} = gemYData;

                if(!gemY && !yOffset) {
                    const selectionGem = selection.gem;
                    const connectionGem = connection.gem;
                    if(selectionGem === gem) {
                        if(selection.gem.moveStart === null && selectionGem.deleteStart === null) {
                            gemX += SELECT_START;
                            gemY += selection.state * GEM_SIZE;
                        }
                    } else if(connectionGem === gem) {
                        if(connectionGem.moveStart === null && connectionGem.deleteStart === null) {
                            gemX += SELECT_START;
                            gemY += connection.state * GEM_SIZE;
                        }
                    }
                }
    
                context.drawImage(gemImage,
                    gemX,gemY,GEM_SIZE,GEM_SIZE,
                    (GEM_SPACE + x * GEM_STRIDE + xOffset) * RENDER_SCALE,
                    (GEM_SPACE + y * GEM_STRIDE + yOffset) * RENDER_SCALE,
                    GEM_RENDER_SIZE,GEM_RENDER_SIZE
                );
            }
        }

        if(restart) {
            this.render(context,size,time);
        }
    };
}
export default Board;
