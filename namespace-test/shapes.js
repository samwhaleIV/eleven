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
Namespace.create({
    name: "shapes",
    modules: [
        Square,
        Circle,
        Singleton({
            module: FixedSquare,
            deferInstallation: false
        })
    ]
});
