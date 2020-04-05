import GetType from "../particle-creator.js";
import EmitterPool from "../emitter-pool.js";

const rainbowColors = Object.freeze([
    "red","orange","yellow",
    "green","cyan","blue","purple"
]);
const rainbowDuration = 300;

const RainbowRain = (()=>{ 
    let colorIndex = 0;
    return GetType("Gravity",{color:()=>{
        const color = rainbowColors[colorIndex];
        colorIndex = (colorIndex + 1) % rainbowColors.length;
        return color;
    }});
})();

const getRainbowPool = () => {
    const colorCount = rainbowColors.length;
    const pool = new EmitterPool(RainbowRain,colorCount);

    const baseStream = pool.stream;
    pool.stream = () => baseStream(
        rainbowDuration,rainbowDuration/colorCount
    );

    return pool;
};

function Install() {
    this.getRainbowPool = getRainbowPool;
    this.RainbowRain = RainbowRain;
}
export default Install;
