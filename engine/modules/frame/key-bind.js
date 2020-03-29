function KeyBind(filters) {
    const pollingFilter = (target,downKeys,time) => {
        const downKeysList = Object.entries(downKeys);
        const keyData = new Object();
        for(let i = 0;i<downKeysList.length;i++) {

            const downKey = downKeysList[i];
            const downKeyHash = downKey[0];
            const downKeyData = downKey[1];

            if(downKeyHash in filters) {
                const impulse = filters[downKeyHash];
                const newData = Object.assign(new Object(),downKeyData);

                newData.impulse = impulse;
                keyData[impulse] = newData;
            }
        }
        return target(keyData,time);
    };
    const impulseFilter = (target,keyEvent) => {
        const newEvent = Object.assign(new Object(),keyEvent);
        const keyHash = keyEvent.code;
        if(keyHash in filters) {
            newEvent.impulse = filters[keyHash];
            return target(newEvent);
        }
    };

    this.poll = target => {
        return (downKeys,time) => pollingFilter(target,downKeys,time);
    };

    this.impulse = target => {
        return keyEvent => {
            impulseFilter(target,keyEvent);
        };
    };

    Object.freeze(this);
}
export default KeyBind;
