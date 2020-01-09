const NAMESPACE_NAME = "Shapes";

function Square(x=0,y=0,size=0) {
    this.x = x;
    this.y = y;
    this.size = size;
    Object.seal(this);
}
function Circle(x=0,y=0,radius=0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    Object.seal(this);
}
function FixedSquare(x,y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
}
const shapes = Namespace.create({
    name: NAMESPACE_NAME,
    modules: [
        Square,
        Circle,
        Singleton({
            module: FixedSquare,
            deferInstantiation: true,
            parameters: [69,420]
        }),
        Singleton({
            name: "FixedSquareDank",
            module: FixedSquare,
            parameters: ["ayy","lmao"]
        }),
    ]
});
export default shapes;
