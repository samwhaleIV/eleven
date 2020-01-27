import Eleven from "../engine/eleven.js";
const { ResourceManager } = Eleven;

function ImageTest() {

    const GEM_SIZE = 10;
    const GEM_ROWS = 10;
    const SCROLL_STEP = 100;

    let gemImage = "gems.png";
    this.load = async () => {
        [gemImage] = await ResourceManager.queueImage(gemImage).load();
    };

    let gemWidth, gemHeight;

    this.resize = (context,size) => {
        context.imageSmoothingEnabled = false;

        gemWidth = Math.min(1200,size.width-20);
        gemHeight = gemWidth / (gemImage.width / (gemImage.height / GEM_ROWS));

        const x = Math.round(size.halfWidth - gemWidth / 2);
        const y = Math.round(size.halfHeight -gemHeight / 2);

        context.setTransform(1,0,0,1,x,y);
    };

    this.render = (context,_,time) => {
        const gemY = Math.floor(time.now / SCROLL_STEP) % GEM_ROWS * GEM_SIZE;
        context.drawImage(
            gemImage,0,gemY,gemImage.width,GEM_SIZE,
            0,0,gemWidth,gemHeight
        );
    };

}
export default ImageTest;
