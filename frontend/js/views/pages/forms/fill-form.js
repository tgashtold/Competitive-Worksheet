import parametersSettings from '../../partials/parameters';
import basicInfoObj from '../../partials/basic-info';
import Component from '../../../views/component';
import FormTemplate from '../../../../templates/pages/forms/fill-form';
import resultObj from '../../partials/result';

class Form extends Component {
    render() {
        return new Promise(resolve => resolve(FormTemplate()));
    }

    afterRender() {
        this.setActions();
        parametersSettings.setActions();
        resultObj.setActions();
        basicInfoObj.setActions();
        parametersSettings.validateTableAllDeleteBtns();
    }

    setActions() {
        const dateBox = document.getElementsByClassName('section-title__date')[0],
            monthBox = document.getElementsByClassName('section-title__month')[0],
            productsNumberBox = document.querySelector('[data-content="products-number"]'),
            suppliersNumberBox = document.querySelector('[data-content="suppliers-number"]');

        basicInfoObj.insertCurrentDate(dateBox);
        basicInfoObj.insertCurrentMonth(monthBox);
        basicInfoObj.setDefaultBasicInfo();
        parametersSettings.adoptProductsNumber(productsNumberBox);
        parametersSettings.adoptSuppliersNumber(suppliersNumberBox);
    }
}

export default Form;

