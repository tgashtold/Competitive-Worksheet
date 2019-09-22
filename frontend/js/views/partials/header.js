import Component from '../../views/component';

import HeaderTemplate from '../../../templates/partials/header';

class Header extends Component {
    render() {
        const resource = this.request.resource;

        return new Promise(resolve => resolve(HeaderTemplate({
            isMainPage: !resource,
            isSavedFormsPage: (resource === 'saved')
        })));
    }
}

export default Header;