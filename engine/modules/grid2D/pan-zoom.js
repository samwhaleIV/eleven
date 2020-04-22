import Constants from "../../internal/constants.js";
const {
    clickDown,
    clickUp,
    pointerMove,
    pointerScroll
} = Constants.InputRoutes;

const DEFAULT_MIN_SCALE = 1;
const DEFAULT_MAX_SCALE = 10;
const ZOOM_RATE = 0.075;

function PanZoom(camera) {
    const {grid} = camera;

    let panData = null;
    let halfWidth = 0, halfHeight = 0, tileSize = 0;

    let minScale = DEFAULT_MIN_SCALE;
    let maxScale = DEFAULT_MAX_SCALE;

    Object.defineProperty(this,"minScale",{
        get: () => minScale,
        set: value => minScale = value,
        enumerable: true
    });
    Object.defineProperty(this,"maxScale",{
        get: () => maxScale,
        set: value => maxScale = value,
        enumerable: true
    });
    this.setScaleLimit = (min=minScale,max=maxScale) => {
        minScale = min;
        maxScale = max;
        if(camera.scale < minScale) {
            camera.scale = minScale;
        } else if(camera.scale > maxScale) {
            camera.scale = maxScale;
        }
        return this;
    };
    const refreshPanData = ({x,y}) => {
        panData = {x,y,cameraX:camera.x,cameraY:camera.y};
    };

    this.resize = size => {
        halfWidth = size.halfWidth;
        halfHeight = size.halfHeight;
        tileSize = size.tileSize;
    };
    this.panStart = refreshPanData;
    this.panEnd = () => {
        panData = null;
    };
    this.pan = ({x,y}) => {
        if(!panData) return;
        const xDifference = panData.x - x;
        const yDifference = panData.y - y;
        camera.x = panData.cameraX + xDifference / tileSize;
        camera.y = panData.cameraY + yDifference / tileSize;
        refreshPanData({x,y});
    };
    this.zoom = ({scrollingUp,x,y}) => {
        const startPosition = grid.getTileLocation(x,y);
        let zoomInTarget = startPosition;

        let worldCenter = grid.getTileLocation(halfWidth,halfHeight);

        const distanceToTarget = {
            x: worldCenter.x - zoomInTarget.x,
            y: worldCenter.y - zoomInTarget.y
        };

        const scaleChange = 1 + (scrollingUp ? ZOOM_RATE : -ZOOM_RATE);
        const startScale = camera.scale;
        let newScale = startScale;

        newScale *= scaleChange;
        if(newScale < minScale) {
            newScale = minScale;
        } else if(newScale > maxScale) {
            newScale = maxScale;
        }
        camera.scale = newScale;

        zoomInTarget = grid.getTileLocation(x,y);
        worldCenter = grid.getTileLocation(halfWidth,halfHeight);

        const newDistanceToTarget = {
            x: worldCenter.x - zoomInTarget.x,
            y: worldCenter.y - zoomInTarget.y
        };

        camera.x += newDistanceToTarget.x - distanceToTarget.x;
        camera.y += newDistanceToTarget.y - distanceToTarget.y;
        if(panData) refreshPanData({x,y});
    };
    this.bindToFrame = frame => {
        frame[clickDown] = this.panStart;
        frame[clickUp] = this.panEnd;
        frame[pointerMove] = this.pan;
        frame[pointerScroll] = this.zoom;
    };
}
export default PanZoom;
