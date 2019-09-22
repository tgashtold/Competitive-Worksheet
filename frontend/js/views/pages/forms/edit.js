import Utils from '../../../helpers/utils';
import parametersSettings from '../../partials/parameters';
import basicInfoObj from '../../partials/basic-info';
import Component from '../../../views/component';
import FormTemplate from '../../../../templates/pages/forms/fill-form';
import resultObj from '../../partials/result';
import suppliers from '../../partials/suppliers';
import Error404Template from '../../../../templates/pages/error404';
import Forms from '../../../models/forms';

class Edit extends Component {
    constructor() {
        super();
        this.model = new Forms();
    }

    getData() {
        return new Promise(resolve => this.model.getForm(this.request.id).then(savedForm => {
            this.form = savedForm;

            resolve(savedForm);
        }));
    }

    render() {
        let template;

        if (this.isEditEnable()) {
            template = FormTemplate();
        } else {
            template = Error404Template();
        }

        return new Promise(resolve => resolve(template));
    }


    afterRender() {
        this.getData().then(form => new Promise(resolve => resolve(this.showSavedItemTable(form))))
            .then(() => {
                this.setProperResultBtnBehavior();
                parametersSettings.validateTableAllDeleteBtns();
            });

        this.addTitle();
        this.deleteActiveMenuMarks();
        parametersSettings.setActions();
        resultObj.setActions();
        basicInfoObj.setActions();
        this.setActions();
    }

    setActions() {
        const saveBtn = document.getElementsByClassName('button-save')[0],
            clearBtn = document.getElementsByClassName('button-clear')[0],
            savedTitleBox = document.getElementsByClassName('saved-title__box')[0],
            savedTitleInput = document.getElementsByClassName('saved-title')[0];

        this.makeDeleteBtn(clearBtn);

        savedTitleBox.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('saved-title')) {
                savedTitleInput.removeAttribute('disabled');
                Utils.validateInputValue(savedTitleInput, 5);
            }
        });

        savedTitleInput.addEventListener('keyup', () => Utils.validateInputValue(savedTitleInput, 5));

        savedTitleInput.addEventListener('blur', () => {
            if (savedTitleInput.value.trim()) {
                savedTitleInput.setAttribute('disabled', true);

                this.model.editFormTitle(this.form.id, savedTitleInput.value.trim()).then(() => this.showSavingConfirmation());
            } else {
                savedTitleInput.setAttribute('disabled', true);
                savedTitleInput.value = this.form.title;
            }
        });

        saveBtn.addEventListener('click', (event) => {
            event.preventDefault();

            this.model.editForm(this.getEditedFormInfo(this.form)).then(() => this.redirectToUpdatedFormInfo(this.form.id));

            this.showSavingConfirmation();
        });

        clearBtn.addEventListener('click', () => {
            this.model.deleteForm(this.form.id).then(() => this.redirectToSavedPage());
        });
    }

    makeDeleteBtn(btn) {
        btn.dataset.state = 'delete';
        btn.textContent = 'удалить';
    }

    getEditedFormInfo(oldForm) {
        const comparisonTypeValue = document.querySelector('[data-content="comparison-type"]'),
            updatedForm = {
                date: new Date().toLocaleDateString(),
                comparisonType: comparisonTypeValue.checked,
                basicInfo: basicInfoObj.getBasicInfoValues(),
                suppliers: suppliers.getAllSuppliersArr()
            };

        updatedForm.id = oldForm.id;
        updatedForm.title = oldForm.title;

        return updatedForm;
    }

    addTitle() {
        const parametersBox = document.getElementsByClassName('parameters')[0];

        parametersBox.insertAdjacentHTML('beforeBegin', `<h2 class="saved-title__box"><input class="saved-title" maxlength="35" disabled type="text" value ="${this.form.title}"></h2>`);
    }

    redirectToSavedPage() {
        location.hash = '#/saved';
    }

    redirectToUpdatedFormInfo(id) {
        location.hash = `#/saved/${id}`;
    }

    setProperResultBtnBehavior() {
        const obligatoryInputsArr = [...document.getElementsByClassName('product-quantity'), ...document.getElementsByClassName('product-price')],
            resultButton = document.getElementsByClassName('button-result')[0];

        if (obligatoryInputsArr.every(val => val.classList.contains('approved-style') && +val.value)) {
            resultButton.hasAttribute('disabled') && resultButton.removeAttribute('disabled');
        } else {
            !resultButton.hasAttribute('disabled') && resultButton.setAttribute('disabled', true);

            !document.getElementsByClassName('result-warning')[0] && resultButton.insertAdjacentHTML('beforeBegin', '<p class="error-JS result-warning">Для просмотра результата необходимо заполнить поля "цена за ед." и "количество". Значения не должны равняться 0.</p>');
        }
    }

    showSavingConfirmation() {
        const savedTitleBox = document.getElementsByClassName('saved-title__box')[0];

        if (!document.getElementsByClassName('saved-message')[0]) {
            savedTitleBox.insertAdjacentHTML('beforeEnd', '<span class="error-JS saved-message"><br>сохранено</span>');

            setTimeout(() => document.getElementsByClassName('saved-message')[0].remove(), 1000);
        }
    }

    isEditEnable() {
        return Object.keys(this.form).length;
    }

    deleteActiveMenuMarks() {
        const menuItemsArr = [...document.getElementsByClassName('menu-item__link')];

        menuItemsArr.forEach(val => val.classList.contains('active') && val.classList.remove('active'));
    }

    showSavedItemTable(item) {
        const productsNumberBox = document.querySelector('[data-content="products-number"]'),
            suppliersNumberBox = document.querySelector('[data-content="suppliers-number"]'),
            comparisonTypeValue = document.querySelector('[data-content="comparison-type"]');
        let suppliersNumber = +item.suppliers.length,
            productsNumber = item.suppliers[0].productsNumber;

        productsNumberBox.value = productsNumber;
        suppliersNumberBox.value = suppliersNumber;
        comparisonTypeValue.checked = item.comparisonType;

        parametersSettings.adoptProductsNumber(productsNumberBox);
        parametersSettings.adoptSuppliersNumber(suppliersNumberBox);
        basicInfoObj.setBasicInfo(item.basicInfo);

        const baseColumn = document.getElementsByClassName('column')[0];

        for (let i = 1; i <= productsNumber; i++) {
            const productBasicInfoBox = baseColumn.querySelector(`[data-product="${i}"]`);
            productBasicInfoBox.getElementsByClassName('product-name')[0].value = item.suppliers[0][`product_${i}`].name;
            productBasicInfoBox.getElementsByClassName('product-measurement')[0].value = item.suppliers[0][`product_${i}`].measureUnit;
            productBasicInfoBox.getElementsByClassName('product-quantity')[0].value = item.suppliers[0][`product_${i}`].quantity;

            [...document.querySelectorAll(`[data-product="${i}"] .product-price`)].forEach((val, n) => {
                val.value = item.suppliers[n][`product_${i}`].price;
            });
            [...document.querySelectorAll(`[data-product="${i}"] .currency`)].forEach((val, n) => {
                val.value = item.suppliers[n][`product_${i}`].currency;
            });
            [...document.querySelectorAll(`[data-product="${i}"] .product-duties`)].forEach((val, n) => {
                val.value = item.suppliers[n][`product_${i}`].customsRate;
            });
            [...document.querySelectorAll(`[data-product="${i}"] .product-tariff`)].forEach((val, n) => {
                val.value = item.suppliers[n][`product_${i}`].customsCode;
            });
        }

        [...document.getElementsByClassName('product__supplier-name')].forEach((val, i) => {
            val.value = item.suppliers[i].name;
        });
        [...document.getElementsByClassName('product-delivery')].forEach((val, i) => {
            val.value = item.suppliers[i].delivery.cost;
        });
        [...document.getElementsByClassName('product-delivery')].map(val => val.parentNode.parentNode.children[1]).forEach((val, i) => {
            val.value = item.suppliers[i].delivery.currency;
        });
        [...document.getElementsByClassName('product-extras')].forEach((val, i) => {
            val.value = item.suppliers[i].extras.cost;
        });
        [...document.getElementsByClassName('product-extras')].map(val => val.parentNode.parentNode.children[1]).forEach((val, i) => {
            val.value = item.suppliers[i].extras.currency;
        });

        [...document.getElementsByClassName('payment')].forEach((val, i) => {
            val.value = item.suppliers[i].payment.paymentCond;

            parametersSettings.addPaymentDescriptionHTML(val);

            switch (item.suppliers[i].payment.paymentCond) {
                case 'postpayment':
                    val.parentNode.getElementsByClassName('postpayment-value')[0].value = item.suppliers[i].payment.postpaymentDays;
                    break;

                case 'prepayment':
                case 'l/c':
                    val.parentNode.getElementsByClassName('prepayment-value')[0].value = item.suppliers[i].payment.prepaymentDays;
                    break;

                case 'part-payment':
                    val.parentNode.getElementsByClassName('prepayment-value')[0].value = item.suppliers[i].payment.prepaymentDays;
                    val.parentNode.getElementsByClassName('postpayment-value')[0].value = item.suppliers[i].payment.postpaymentDays;
                    val.parentNode.getElementsByClassName('postpayment-rate')[0].value = item.suppliers[i].payment.postpaymentPersant;
                    val.parentNode.getElementsByClassName('prepayment-rate')[0].value = item.suppliers[i].payment.prepaymentPersant;
                    break;
            }
        });

        [...document.getElementsByClassName('product-tariff')].forEach(val => {
            if (!val.value.trim() && +val.parentNode.parentNode.getElementsByClassName('product-duties')[0].value == 0) {
                val.value = 'нет';
            }
        });

        [...document.getElementsByClassName('form__elem-value')].forEach(val => Utils.validateInputValue(val, 5));
    }
}

export default Edit;