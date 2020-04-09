/* Sometimes we have to make sacrifices for the greater good.. */

const evalProperty = value => {
    return typeof value === "function" ? value : () => value;
};

function EvaulationTable(
    size,color,count,scale,start,drift,duration,bufferSize
) {
    this.size = evalProperty(size);
    this.color = evalProperty(color);
    this.count = evalProperty(count)
    this.scale = evalProperty(scale);
    this.start = evalProperty(start);
    this.drift = evalProperty(drift);
    this.duration = evalProperty(duration);
    this.bufferSize = evalProperty(bufferSize);
}

export default EvaulationTable;
