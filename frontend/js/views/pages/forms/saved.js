import Component from '../../../views/component';
import SavedTemplate from '../../../../templates/pages/forms/saved';
import Forms from '../../../models/forms';
import SavedItemTemplate from '../../../../templates/pages/forms/saved-form';

class Saved extends Component {
    constructor() {
        super();
        this.model = new Forms();
    }

    getData() {
        return new Promise(resolve => this.model.getSavedForms()
            .then(savedFormsArr => resolve(savedFormsArr)));
    }

    render() {
        return new Promise(resolve => resolve(SavedTemplate()));
    }

    afterRender() {
        this.getData().then(forms => this.addSavedItemHTML(forms));
        this.setActions();
    }

    setActions() {
        const savedWrapper = document.getElementsByClassName('saved')[0];

        savedWrapper.addEventListener('click', (event) => {
            const target = event.target,
                targetClassList = target.classList;

            if (target.dataset.state == 'delete') {
                this.model.deleteForm(target.parentNode.parentNode.dataset.id).then(() => {
                    target.parentNode.parentNode.remove();
                    this.model.getSavedForms().then(forms => this.addSavedItemHTML(forms));
                });
            }

            targetClassList.contains('saved-item') && this.redirectToSavedFormInfo(target.dataset.id);

            targetClassList.contains('saved-item__name') && this.redirectToSavedFormInfo(target.parentNode.dataset.id);
        });
    }

    redirectToSavedFormInfo(id) {
        location.hash = `#/saved/${id}`;
    }

    addSavedItemHTML(savedArr) {
        const savedItemsContainer = document.getElementsByClassName('saved-box')[0];

        if (!savedArr.length) {
            savedItemsContainer.innerHTML = '<span class="error-JS">Нет сохраненных конкурентных листов</span>';
        }

        if (savedArr.length) {
            savedItemsContainer.innerHTML = '';
            savedArr.forEach(val => savedItemsContainer.insertAdjacentHTML('afterBegin', `${this.getSavedItemHTML(val)}`));
        }
    }

    getSavedItemHTML(itemObj) {
        return SavedItemTemplate({itemObj});
    }
}

export default Saved;