function KeyBind() {

    const filters = {};
    this.addFilter = ({code,impulse}) => {
        filters[code] = impulse;
    };
    this.addFilters = newFilters => {
        newFilters.forEach(this.addFilter);
    };
    this.getFilters = () => {
        return Object.assign(new Object(),filters);
    };
    this.getFilter = code => {
        return filters[code];
    };
    const clearFilters = () => {
        Object.keys(filters,Reflect.deleteProperty.bind(filters));
    };
    this.setFilter = filterSet => {
        clearFilters();
        Object.assign(filters,filterSet);
    };
    this.clearFilters = clearFilters;

    const pollingFilter = (target,downKeys) => {
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
        return target(keyData);
    };
    const keyFilter = (target,keyEvent) => {
        const newEvent = Object.assign(new Object(),keyEvent);
        const keyHash = keyEvent.code;
        if(keyHash in filters) {
            newEvent.impulse = filters[keyHash];
            return target(newEvent);
        }
        return undefined;
    };

    this.getPollingFilter = target => {
        return pollingFilter.bind(null,target);
    };
    this.getKeyFilter = target => {
        return keyFilter.bind(null,target);
    };

    Object.freeze(this);
}
export default KeyBind;
