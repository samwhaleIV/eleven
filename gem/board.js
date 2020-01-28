//All ye who enter here abandon all hope

import Eleven from "../engine/eleven.js";
const { CanvasManager, ResourceManager } = Eleven;

const GEM_IMAGE = "gems.png";
const BOARD_ROWS = 9;
const BOARD_COLUMNS = 9;
const GEM_SIZE = 10;
const GEM_SPACE = 1;
const GEM_STRIDE = GEM_SIZE + GEM_SPACE;
const GEM_COUNT = 4;
const SELECT_START = GEM_COUNT * GEM_SIZE;

const ANIMATION_ROWS = 10;
const ANIMATION_STEP = 30;
const MOVE_TIME = 250;
const CLICK_TIMEOUT = 100;

const RENDER_SCALE = 5;

const GEM_RENDER_SIZE = GEM_SIZE * RENDER_SCALE;

const getBoardLength = dimensionLength => {
    return ((GEM_SIZE + GEM_SPACE) * dimensionLength + GEM_SPACE) * RENDER_SCALE;
};

const BOARD_WIDTH = getBoardLength(BOARD_COLUMNS);
const BOARD_HEIGHT = getBoardLength(BOARD_ROWS);

const DIRECTIONS = Object.freeze({
    Up: -1,
    Left: -2,
    Down: 1,
    Right: 2
});

const SELECT_STATES = Object.freeze({
    None: null,
    Hover: 0,
    Lock: 1,
    HoverConnect: 2
});

const getGem = type => {
    return Object.seal({type,moveStart:null,deleteStart:null,moveCallback:null,direction:null});
};
const getGemY = (gem,time) => {
    let gemY = 0;
    let yOffset = 0;
    if(gem.moveStart !== null) {
        if(gem.direction % 2 !== 0) {
            let delta = (time.now - gem.moveStart) / MOVE_TIME;
            if(delta > 1) {
                delta = 1;
                gem.moveCallback();
                return RESTART;
            }
            yOffset += Math.sign(gem.direction) * GEM_STRIDE * delta;
        }
    } else if(gem.deleteStart !== null) {
        const delta = time.now - gem.deleteStart;
        let animationRow = Math.floor(delta / ANIMATION_STEP);
        if(animationRow >= ANIMATION_ROWS) {
            animationRow = ANIMATION_ROWS - 1;
        }
        gemY = animationRow * GEM_SIZE;
    }
    return {gemY,yOffset};
}
const RESTART = Symbol("Restart");
const getGemX = (gem,time) => {
    let gemX = gem.type * GEM_SIZE;
    let xOffset = 0;
    if(gem.moveStart !== null) {
        if(gem.direction % 2 === 0) {
            let delta = (time.now - gem.moveStart) / MOVE_TIME;
            if(delta > 1) {
                delta = 1;
                gem.moveCallback();
                return RESTART;
            }
            xOffset += Math.sign(gem.direction) * GEM_STRIDE * delta;
        }
    }
    return {gemX,xOffset};
};

const moveGem = (gem,x,y,callback) => {
    if(x) {
        gem.moveStart = performance.now();
        gem.direction = x < 0 ? DIRECTIONS.Left : DIRECTIONS.Right;
        gem.moveCallback = callback;
    } else if(y) {
        gem.moveStart = performance.now();
        gem.direction = y < 0 ? DIRECTIONS.Up : DIRECTIONS.Down;
        gem.moveCallback = callback;
    }
};

const getRandomGem = () => {
    return getGem(Math.floor(Math.random() * GEM_COUNT))
};
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
    const data = getBoardData();
    this.get = (x,y) => {
        return data[y][x];
    };
    this.set = (x,y,value) => {
        return data[y][x] = value;
    };
    this.data = data;
    Object.freeze(this);
}

const getSelectionState = () => {
    return Object.seal({gem:null,state:SELECT_STATES.None,x:null,y:null});
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

    let locked = false;
    this.pointerMove = ({x,y}) => {
        if(locked) return;
        x = Math.floor(x / (BOARD_WIDTH / BOARD_COLUMNS));
        y = Math.floor(y / (BOARD_HEIGHT / BOARD_ROWS));
        if(x < 0 || y < 0 || y >= BOARD_ROWS || x >= BOARD_COLUMNS) {
            return;
        }
        const gem = boardData.get(x,y);
        let selectionTarget = selection;
        if(selection.state === SELECT_STATES.Lock) {
            selectionTarget = connection;
            const xDistance = Math.abs(connection.x-selection.x);
            const yDistance = Math.abs(connection.y-selection.y);
            if(xDistance + yDistance === 1) {
                selectionTarget.state = SELECT_STATES.HoverConnect;
            } else {
                selectionTarget.state = SELECT_STATES.None;
                selectionTarget.gem = null;
            }
        }
        selectionTarget.x = x;
        selectionTarget.y = y;
        selectionTarget.gem = gem;
    };
    let clickTime = null;
    let clickLock = false;
    this.clickDown = event => {
        if(locked) return;
        clickTime = performance.now();
        if(selection.state !== SELECT_STATES.Lock) {
            selection.state = SELECT_STATES.Lock;
            connection.state = SELECT_STATES.HoverConnect;
        } else if(clickLock) {
            if(selection.state === SELECT_STATES.Lock) {
                this.pointerMove(event);
            }
            clickTime = -Infinity;
            this.clickUp(event,true);
            clickLock = false;
        }
    };
    this.clickUp = (_,ignoreClickLock) => {
        if(locked) return;
        if(!ignoreClickLock) {
            if(clickLock) {
                return;
            }
        }
        const clickDelta = performance.now() - clickTime;
        if(clickDelta < CLICK_TIMEOUT) {
            clickLock = true;
            return;
        }
        if(selection.state !== SELECT_STATES.Lock) return;
        if(selection.gem === connection.gem) {
            selection.state = SELECT_STATES.Hover;
            connection.state = SELECT_STATES.None;
            connection.gem = null;
        } else if(connection.state === SELECT_STATES.HoverConnect && selection.state === SELECT_STATES.Lock) {
            let moveCount = 0;
            const callback = () => {
                if(++moveCount !== 2) return;
                const oldGem = selection.gem;
                const newGem = connection.gem;

                const oldGemType = oldGem.type;
                oldGem.type = newGem.type;
                newGem.type = oldGemType;

                oldGem.moveStart = null;
                newGem.moveStart = null;

                const connectX = connection.x;
                const connectY = connection.y;

                connection.x = selection.x;
                connection.y = selection.y;

                selection.x = connectX;
                selection.y = connectY;

                selection.state = SELECT_STATES.Hover;

                selection.gem = null;
                connection.gem = null;

                locked = false;
            };
            let selectionX = 0, selectionY = 0;
            if(selection.x === connection.x) {
                if(selection.y < connection.y) {
                    selectionY = 1;
                } else {
                    selectionY = -1;
                }
            } else if(selection.y === connection.y) {
                if(selection.x < connection.x) {
                    selectionX = 1;
                } else {
                    selectionX = -1;
                }
            }
            let connectionX = -selectionX, connectionY = -selectionY;
            locked = true;
            selection.state = SELECT_STATES.None;
            connection.state = SELECT_STATES.None;
            moveGem(selection.gem,selectionX,selectionY,callback);
            moveGem(connection.gem,connectionX,connectionY,callback);
        } else {
            selection.state = SELECT_STATES.Hover;
            connection.state = SELECT_STATES.None;
            connection.gem = null;
        }
        
    };

    this.resize = context => {
        context.imageSmoothingEnabled = false;
        context.fillStyle = "white";
    };

    const gemData = boardData.data;

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

                if(gemXData === RESTART || gemYData === RESTART) {
                    restart = true;
                    continue;
                }
    
                let {gemX, xOffset} = gemXData;
                let {gemY, yOffset} = gemYData;

                if(!gemY && !yOffset) {
                    if(selection.gem === gem) {
                        if(selection.state !== SELECT_STATES.None) {
                            gemX += SELECT_START;
                            gemY += selection.state * GEM_SIZE;
                        }
                    } else if(connection.gem === gem) {
                        if(connection.state !== SELECT_STATES.None) {
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
