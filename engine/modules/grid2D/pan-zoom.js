import Constants from "../../internal/constants.js";
const {
    clickDown,
    clickUp,
    pointerMove,
    pointerScroll
} = Constants.InputRoutes;

const ZOOM_RATE = 0.1;
const ZOOM_PAN_DAMPENER = 10;
const DEFAULT_MIN_SCALE = 1;
const DEFAULT_MAX_SCALE = 10;

function PanZoom(camera) {
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
        const scaleChange = 1 + (scrollingUp?ZOOM_RATE:-ZOOM_RATE);
        let startScale = camera.scale;
        startScale *= scaleChange;

        if(startScale < minScale) {
            camera.scale = minScale;
            return;
        } else if(startScale > maxScale) {
            camera.scale = maxScale;
            return;
        }
        camera.scale = startScale;

        let centerXOffset = x - halfWidth;
        let centerYOffset = y - halfHeight;

        if(!scrollingUp) {
            centerXOffset = -centerXOffset;
            centerYOffset = -centerYOffset;
        }

        camera.x += centerXOffset / tileSize / ZOOM_PAN_DAMPENER;
        camera.y += centerYOffset / tileSize / ZOOM_PAN_DAMPENER;
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
