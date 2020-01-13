function ColorPicker(colors=[
    "yellow","red","blue","green",
    "orange","brown","pink","purple"
]) {
    const max = colors.length-1;
    const min = 0;

    const picker = document.createElement("div");
    picker.classList.add("color-picker");

    const left = document.createElement("div");
    const middle = document.createElement("div");
    const right = document.createElement("div");

    let index = min;
    let color = colors[min];

    const safeColor = index => {
        if(index < min) {
            index = max;
        } else if(index > max) {
            index = min;
        }
        return colors[index];
    }

    const setColors = () => {
        color = colors[index];
        const leftColor = safeColor(index-1);
        const rightColor = safeColor(index+1);

        left.style.backgroundColor = leftColor;
        middle.style.backgroundColor = color;
        right.style.backgroundColor = rightColor;
    };

    left.onclick = function cycleLeft() {
        index -= 1;
        if(index < min) {
            index = max;
        }
        setColors();
    }
    right.onclick = function cycleRight() {
        index += 1;
        if(index > max) {
            index = min;
        }
        setColors();
    }

    picker.appendChild(left);
    picker.appendChild(middle);
    picker.appendChild(right);

    setColors();

    document.body.appendChild(picker);

    Object.defineProperty(this,"color",{
        get: function() {return color}
    });

    Object.freeze(this);
}
export default ColorPicker;
