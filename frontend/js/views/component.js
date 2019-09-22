import Utils from '../helpers/utils';

class Component {
    constructor() {
        this.request = Utils.parseRequestURL();
    }

    getData() {
        return new Promise(resolve => resolve());
    }

    afterRender() {}
}

export default Component;