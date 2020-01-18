const triangle = (a,b,c) => {
    return {a,b,c};
};
const point = (x,y) => {
    return {x,y};
}
const lerp1D = (a,b,t) => {
    return (1 - t) * a + t * b;
};
const lerp2D = (a,b,t) => {
    const tInverse = 1 - t;
    return point(
        tInverse * a.x + t * b.x,
        tInverse * a.y + t * b.y
    );
};
const subdivide2Random = () => {
    return 0.58;
    const maxDifference = 0.08;
    const range = maxDifference * 2;
    return 0.5 + (Math.random() * range) - maxDifference;
};
const subdivide4Random = () => {
    return 0.5;
    const margin = 0.25;
    const min = 0.5 - margin;
    const max = 0.5 + margin;
    const range = max - min;
    return range * Math.random() + min;   
};
const subdivide3Random = () => {
    return {
        x: 0.5,
        y: 0.5
    };
};
const getRandomPoint = (a,b,c) => {
/*
    Credit to https://stackoverflow.com/a/47425047
    and http://www.cs.princeton.edu/~funk/tog02.pdf
*/
    const {x, y} = subdivide3Random();

    const xRoot = Math.sqrt(x);

    const xRootInverse = 1 - xRoot;
    const yInverse = 1 - y;

    return point(
        a.x * xRootInverse + b.x * yInverse * xRoot + c.x * y * xRoot,
        a.y * xRootInverse + b.y * yInverse * xRoot + c.y * y * xRoot
    );
};
const subdivide2 = ({a,b,c}) => {
    const ab = lerp2D(a,b,subdivide2Random());
    return [
        triangle(c,b,ab),
        triangle(c,a,ab)
    ];
};
const subdivide3 = ({a,b,c}) => {
    const center = getRandomPoint(a,b,c);
    return [
        triangle(a,b,center),
        triangle(b,c,center),
        triangle(a,c,center)
    ];
};
const subdivide4 = ({a,b,c}) => {
    const d = lerp2D(a,b,subdivide4Random());
    const e = lerp2D(a,c,subdivide4Random());
    const f = lerp2D(b,c,subdivide4Random());
    return [
        triangle(a,d,e),
        triangle(d,b,f),
        triangle(e,f,c),
        triangle(d,e,f)
    ];
};
const subdivisions = [subdivide3];
const subdivide = triangle => subdivisions[
    Math.floor(Math.random()*subdivisions.length)
](triangle);

const distance = (a,b) => Math.sqrt(
    Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2)
);
const area = triangle => {
/*
    Credit to https://en.wikipedia.org/wiki/Heron%27s_formula
    and Hero of Alexandria and Archimedes of Syracuse
*/
    const a = distance(triangle.a,triangle.b);
    const b = distance(triangle.b,triangle.c);
    const c = distance(triangle.a,triangle.c);

    return 0.25 * Math.sqrt(
        (a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c)
    );
};
