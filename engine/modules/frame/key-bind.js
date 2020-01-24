function KeyBind(filters) {
    const impulses = Object.freeze(
        Object.assign(new Object(),filters)
    );
    this.pollingFilter = (target,downKeys) => {
        const downKeysList = Object.entries(downKeys);
        const keyData = new Object();
        for(let i = 0;i<downKeysList.length;i++) {

            const downKey = downKeysList[i];
            const downKeyHash = downKey[0];
            const downKeyData = downKey[1];

            if(downKeyHash in impulses) {
                const impulse = impulses[downKeyHash];
                const newData = Object.assign(new Object(),downKeyData);

                newData.impulse = impulse;
                keyData[impulse] = newData;
            }
        }
        return target(keyData);
    };
    this.keyFilter = (target,keyEvent) => {
        const newEvent = Object.assign(new Object(),keyEvent);
        const keyHash = keyEvent.code;
        if(keyHash in impulses) {
            newEvent.impulse = impulses[keyHash];
            return target(newEvent);
        }
    };

    Object.freeze(this);
}
export default KeyBind;
