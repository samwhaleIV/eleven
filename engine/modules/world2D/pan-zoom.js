const ZOOM_RATE = 0.1;
const ZOOM_PAN_DAMPENER = 10;

function PanZoom(world,camera) {
    let panData = null;
    let halfWidth = 0, halfHeight = 0;
    this.resize = size => {
        halfWidth = size.halfWidth;
        halfHeight = size.halfHeight;
    };
    this.panStart = ({x,y}) => {
        panData = {x,y,cameraX:camera.x,cameraY:camera.y};
    };
    this.panEnd = () => {
        panData = null;
    };
    this.pan = ({x,y}) => {
        if(!panData) return;
        const xDifference = panData.x - x;
        const yDifference = panData.y - y;
        camera.x = panData.cameraX + xDifference / world.tileSize;
        camera.y = panData.cameraY + yDifference / world.tileSize;
    };
    this.zoom = ({scrollingUp,x,y}) => {
        const scaleChange = 1 + (scrollingUp?ZOOM_RATE:-ZOOM_RATE);
        camera.scale *= scaleChange;

        let centerXOffset = x - halfWidth;
        let centerYOffset = y - halfHeight;

        if(!scrollingUp) {
            centerXOffset = -centerXOffset;
            centerYOffset = -centerYOffset;
        }

        camera.x += centerXOffset / world.tileSize / ZOOM_PAN_DAMPENER;
        camera.y += centerYOffset / world.tileSize / ZOOM_PAN_DAMPENER;
        if(panData) {
            panData = {x,y,cameraX:camera.x,cameraY:camera.y};
        }
    };
}
export default PanZoom;
