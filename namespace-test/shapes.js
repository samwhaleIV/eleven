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
function FixedSquare() {
    this.x = 0;
    this.y = 0;
    Object.freeze(this);
}
const shapes = Namespace.create({
    name: NAMESPACE_NAME,
    modules: [
        Square,
        Circle,
        Singleton({
            module: FixedSquare,
            deferInstallation: false
        })
    ]
});
export default shapes;
