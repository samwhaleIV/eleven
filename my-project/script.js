const context = Eleven.CanvasManager.context;

context.textBaseline = "middle";
context.textAlign = "center";

context.font = "22px sans-serif";
context.fillStyle = "white";

context.fillText(
    "Hello, world!",
    context.size.halfWidth,
    context.size.halfHeight
);
