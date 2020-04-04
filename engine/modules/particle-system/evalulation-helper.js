const EvalProperty = value => {
    return typeof value === "function" ? value : () => value;
};
const ExecProperty = value => EvalProperty(value)();

function EvaulationTable(
    size,color,count,scale,start,drift,duration,bufferSize
) {
    this.size = EvalProperty(size);
    this.color = EvalProperty(color);
    this.count = EvalProperty(count);
    this.scale = EvalProperty(scale);
    this.start = EvalProperty(start);
    this.drift = EvalProperty(drift);
    this.duration = EvalProperty(duration);
    this.bufferSize = EvalProperty(bufferSize);
}

const EvaluationHelper = Object.freeze({
    EvaulationTable,EvalProperty,ExecProperty
});

export default EvaluationHelper;

