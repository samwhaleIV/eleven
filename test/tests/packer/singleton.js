ElevenTest.Add(function(){
    function Square(x,y,size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
    function Circle(x,y,radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    function FixedSquare(x,y,size) {
        Square.call(this,x,y,size);
    }
    const shapes = Namespace.create({
        name: "Shapes",
        modules: [
            Square,Circle,
            Singleton({
                name: "FixedSquare2",
                module: FixedSquare,
            }),
            Singleton({
                name: "FixedSquareDeferred",
                module: FixedSquare,
                autoInstantiation: true,
                deferInstantiation: true
            }),
            Singleton({
                name: "ImmediateFixedSquare",
                module: FixedSquare,
                autoInstantiation: true,
                deferInstantiation: false,
                parameters: [69,420,20]
            }),
            Singleton({
                name: "FixedSquareManual",
                module: FixedSquare,
                autoInstantiation: false,
                deferInstantiation: true
            })
        ]
    });

    const fixedSquareValue = 27;
    const immediateSquareValue = 69;

    let target;
    target = shapes.FixedSquareDeferred;
    target.x = fixedSquareValue;
    target = shapes.ImmediateFixedSquare;
    target.x = immediateSquareValue;
    target = shapes.FixedSquareManual(0,0,10);
    target.x = -5;
    target = shapes.FixedSquareManual();
    target.x += 10;
    target = shapes.FixedSquareManual(241341234,2342423,42342423);
    target.x += 5;
    target = shapes.FixedSquareManual();

    ElevenTest.Assert(target.x === 10 && target.size === 10,`Fixed singleton failure. {autoInstantiation: false,deferInstantiation: true}`);

    target = shapes.FixedSquareDeferred;
    ElevenTest.Assert(target.x === fixedSquareValue,"FixedSquareDeferred has unexpected value");

    target = shapes.ImmediateFixedSquare;
    ElevenTest.Assert(target.x === immediateSquareValue,"ImmediateFixedSquare has expected value");

},"packer/singleton.js");
