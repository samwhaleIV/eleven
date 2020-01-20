import engine from "../engine/eleven.js";

Namespace.makeGlobal(engine);
const canvasManager = engine.CanvasManager;

function TrigRecursion() {

    const MINIMUM_SIZE = 20000;

    const getTriangles = ({width,height}) => {
        const triangles = [];


        const x = Math.min(Math.max(canvasManager.pointer.x,0),width);
        const y = Math.min(Math.max(canvasManager.pointer.y,0),height);

        const a = point(0,0);
        const b = point(width,0);
        const c = point(0,height);
        const d = point(width,height);
        const e = point(x,y);

        const roots = [
            triangle(a,e,b),
            triangle(b,e,d),
            triangle(d,e,c),
            triangle(a,e,c)
        ];

        const recurse = triangle => {
            subdivide(triangle).forEach(sub => {
                if(area(sub) > MINIMUM_SIZE) {
                    recurse(sub);
                } else {
                    triangles.push(sub);
                }
            });
        };
        roots.forEach(recurse);
        console.log(triangles.length*3);
        return triangles;
    };

    this.render = (context,_,size) => {
        context.fillStyle = "black";
        context.fillRect(0,0,size.width,size.height);

        context.strokeStyle = "white";
        context.lineWidth = 1;

        getTriangles(size).forEach(({a,b,c}) => {
            context.beginPath();
            context.moveTo(a.x,a.y);
            context.lineTo(b.x,b.y);
            context.lineTo(c.x,c.y);
            context.lineTo(a.x,a.y);
            context.stroke();
        });
    }
}

canvasManager.start({
    target: document.getElementById("triangle-container"),
    frame: new TrigRecursion(),
    markLoaded: true
});
