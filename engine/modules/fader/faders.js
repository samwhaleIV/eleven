/* Someone this managed to be the most unintentionally racist code in the entire codebase */

const colorProcessor = (r,g,b,a) => `rgba(${r},${g},${b},${a})`;

const getColored = (r,g,b) => {
    return (context,{width,height},t) => {
        context.fillStyle = colorProcessor(r,g,b,t);
        context.fillRect(0,0,width,height);
    };
};

const Black = (context,{width,height},t) => {
    context.fillStyle = `rgba(0,0,0,${t})`;
    context.fillRect(0,0,width,height);
};

const White = (context,{width,height},t) => {
    context.fillStyle = `rgba(255,255,255,${t})`;
    context.fillRect(0,0,width,height);
};

function Faders() {Object.freeze(Object.assign(this,{
    getColored, Black, White
}))}

export default Faders;
