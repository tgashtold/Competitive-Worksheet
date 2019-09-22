import Utils from '../../helpers/utils';
import basicInfoObj from './basic-info';
import suppliers from './suppliers';
import Forms from '../../models/forms';
import saveWindowTemplate from '../../../templates/partials/save-window';
import productPriceCellTemplate from '../../../templates/partials/price-cell';
import paymentTermsTemplate from '../../../templates/partials/payment-terms';
import deleteBtnTemplate from '../../../templates/partials/delete-btn';
import productInitialInfoTemplate from '../../../templates/partials/product-initial-info';
import supplierNameTemplate from '../../../templates/partials/supplier-name';
import supplierConditionsTemplate from '../../../templates/partials/supplier-conditions';


class Parameters {
    constructor() {
        this.model = new Forms();
    }

    setActions() {
        const productsNumberBox = document.querySelector('[data-content="products-number"]'),
            suppliersNumberBox = document.querySelector('[data-content="suppliers-number"]'),
            comparisonTypeValue = document.querySelector('[data-content="comparison-type"]'),
            tableBox = document.getElementsByClassName('table')[0],
            btnWrapper = document.getElementsByClassName('button-wrapper')[0];

        productsNumberBox.addEventListener('keyup', () => {
            if (!(/^([1-9]||(10))$/.test(productsNumberBox.value.trim())) && productsNumberBox.value.trim()) {
                productsNumberBox.value = '';
            }

            this.adoptProductsNumber(productsNumberBox);
            this.validateDeleteProductBtns(productsNumberBox);
        });

        suppliersNumberBox.addEventListener('keyup', () => {
            if (!(/^[2-4]$/.test(suppliersNumberBox.value.trim())) && suppliersNumberBox.value.trim()) {
                suppliersNumberBox.value = '';
            }
            this.adoptSuppliersNumber(suppliersNumberBox);
            this.validateDeleteSupplierBtns(suppliersNumberBox);
        });

        tableBox.addEventListener('click', (event) => {
            const target = event.target,
                targetClassList = target.classList;

            if (targetClassList.contains('delete-elem__button')) {
                target.parentNode.parentNode.classList.contains('product__supplier') ?
                    this.deleteSupplier(target, suppliersNumberBox) : this.deleteProduct(target, productsNumberBox);

                this.validateTableAllDeleteBtns();
            }
        });

        tableBox.addEventListener('keyup', (event) => {
            const target = event.target,
                targetClassList = target.classList;

            if (targetClassList.contains('product-tariff')) {
                const dutiesInput = target.parentNode.parentNode.getElementsByClassName('product-duties')[0];

                dutiesInput.setAttribute('disabled', true);

                Utils.validateInputValue(target, 2);
                this.getCustomsDutyRateFromTariff(target, dutiesInput);

                Utils.validateInputValue(dutiesInput, 5);

                target.value.trim() ? dutiesInput.setAttribute('disabled', true) : dutiesInput.removeAttribute('disabled');
            }

            if (targetClassList.contains('product-name') || targetClassList.contains('product__supplier-name') || targetClassList.contains('save-window__area')) {
                Utils.validateInputValue(target, 5);
            }

            if (targetClassList.contains('product-measurement')) {
                Utils.validateInputValue(target, 4);
            }

            if (target.parentNode.parentNode.classList.contains('payment-parameters')) {
                Utils.validateInputValue(target, 3);
            }

            if (targetClassList.contains('product-duties')) {
                const tariffInput = target.parentNode.parentNode.getElementsByClassName('product-tariff')[0];

                Utils.validateInputValue(target, 1);

                if (target.value.trim()) {
                    tariffInput.setAttribute('disabled', true);
                    tariffInput.value = 'нет';

                    Utils.validateInputValue(tariffInput, 5);
                } else {
                    tariffInput.removeAttribute('disabled');
                    tariffInput.value = '';

                    Utils.validateInputValue(tariffInput, 5);
                }
            }

            if (target.parentNode.parentNode.classList.contains('payment-parameters')) {
                Utils.validateInputValue(target, 3);
            }

            if (targetClassList.contains('product-price') || targetClassList.contains('product-quantity') || targetClassList.contains('product-duties') || targetClassList.contains('product-delivery') || targetClassList.contains('product-extras')) {
                Utils.validateInputValue(target, 1);
            }
        });

        tableBox.addEventListener('change', (event) => {
            const target = event.target,
                targetClassList = target.classList;

            if (targetClassList.contains('payment')) {
                this.addPaymentDescriptionHTML(target);
            }

            if (targetClassList.contains('currency')) {
                if (target.parentNode.parentNode.parentNode.classList.contains('row-product')) {
                    const currencyElemColl = target.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('currency'),
                        productCurrencyColl = [...currencyElemColl].filter(val => val.parentNode.parentNode.parentNode.classList.contains('row-product'));

                    productCurrencyColl.forEach(val => val.value = target.value);
                }
            }
        });

        btnWrapper.addEventListener('keyup', (event) => {
            const target = event.target;

            if (target.classList.contains('save-window__area')) {
                Utils.validateInputValue(target, 5);

                btnWrapper.getElementsByClassName('error-JS')[0] && btnWrapper.getElementsByClassName('error-JS')[0].remove();
            }
        });

        btnWrapper.addEventListener('click', (event) => {
            const target = event.target,
                saveBtn = document.getElementsByClassName('button-save')[0],
                saveWindow = document.getElementsByClassName('save-window')[0],
                saveWindowContainer = document.getElementsByClassName('save-window__wrapper')[0],
                tableInputsArr = [...document.getElementsByClassName('form__elem-value')],
                clearBtn = document.getElementsByClassName('button-clear')[0],
                resultBtn = document.getElementsByClassName('button-result')[0];

            if (target == clearBtn) {
                event.preventDefault();

                productsNumberBox.value = 1;
                suppliersNumberBox.value = 2;
                comparisonTypeValue.checked = true;

                parametersSettings.adoptProductsNumber(productsNumberBox);
                parametersSettings.adoptSuppliersNumber(suppliersNumberBox);
                basicInfoObj.setDefaultBasicInfo();

                this.resetTableCells();

                [...document.getElementsByClassName('row-product')].forEach(val => val.classList.contains('best') && val.classList.remove('best'));

                resultBtn.dataset.state = 'show';
                resultBtn.textContent = 'показать результат';
                document.getElementsByClassName('result')[0].innerHTML = '';
            }

            if (target == saveBtn && (location.hash == '#/' || location.hash == '')) {
                event.preventDefault();

                const isTableInpuntsEmpty = [...document.getElementsByClassName('form__elem-value')].every(val => !val.value.trim());

                if (!saveWindow && isTableInpuntsEmpty) {
                    alert('Невозможно сохранить. Конкурентный лист пуст.');
                }

                if (!saveWindow && !isTableInpuntsEmpty) {
                    saveWindowContainer.innerHTML = `${saveWindowTemplate()}`;
                }

                if (saveWindow) {
                    let formName = document.getElementsByClassName('save-window__area')[0].value.trim();

                    if (formName && !(tableInputsArr.some(val => {
                        return val.value.trim() && val.classList.contains('error-style');
                    }))) {
                        const formForSave = {
                            date: new Date().toLocaleDateString(),
                            title: formName,
                            comparisonType: comparisonTypeValue.checked,
                            basicInfo: basicInfoObj.getBasicInfoValues(),
                            suppliers: suppliers.getAllSuppliersArr()
                        };

                        this.model.addForm(formForSave).then(savedForm => this.redirectToSavedFormInfo(savedForm.id));
                    }

                    if (formName && tableInputsArr.some(val => {
                        return val.value.trim() && val.classList.contains('error-style');
                    })) {
                        alert('Невозможно сохранить. Отдельные поля таблицы содержат недопустимые значения.');
                    }

                    if (!formName) {
                        !btnWrapper.getElementsByClassName('error-JS')[0] && saveWindow.insertAdjacentHTML('afterBegin', '<p class="error-JS window-error">Необходимо ввести название</p>');
                    }
                }
            }

            if (target.classList.contains('button-cancel')) {
                saveWindowContainer.innerHTML = '';
            }
        });

    }

    resetTableCells() {
        [...document.getElementsByClassName('form__elem-value')].forEach(val => {
            val.value = '';
            Utils.validateInputValue(val, 5);
        });
        [...document.getElementsByClassName('currency')].forEach(val => val.value = 'BYN');
        [...document.getElementsByClassName('payment')].forEach(val => val.value = 'default');
        [...document.getElementsByClassName('payment-parameters')].forEach(val => val.innerHTML = '');
    }

    validateTableAllDeleteBtns() {
        const productsNumberBox = document.querySelector('[data-content="products-number"]'),
            suppliersNumberBox = document.querySelector('[data-content="suppliers-number"]');

        this.validateDeleteSupplierBtns(suppliersNumberBox);
        this.validateDeleteProductBtns(productsNumberBox);
    }


    validateDeleteSupplierBtns(suppliersNumberBox) {
        const deleteBtnsArr = [...document.getElementsByClassName('delete-elem__button')],
            deleteSupplierBtnsArr = deleteBtnsArr.filter(val => val.parentNode.parentNode.hasAttribute('data-supplier'));

        if (+suppliersNumberBox.value > 2) {
            deleteSupplierBtnsArr.forEach(val => val.hasAttribute('disabled') && val.removeAttribute('disabled'));

        }
        if (+suppliersNumberBox.value == 2) {
            deleteSupplierBtnsArr.forEach(val => !val.hasAttribute('disabled') && val.setAttribute('disabled', true));
        }
    }

    validateDeleteProductBtns(productsNumberBox) {
        const deleteBtnsArr = [...document.getElementsByClassName('delete-elem__button')],
            deleteProductBtnsArr = deleteBtnsArr.filter(val => val.parentNode.hasAttribute('data-product'));

        if (+productsNumberBox.value > 1) {
            deleteProductBtnsArr.forEach(val => val.hasAttribute('disabled') && val.removeAttribute('disabled'));
        }

        if (+productsNumberBox.value == 1) {
            deleteProductBtnsArr.forEach(val => !val.hasAttribute('disabled') && val.setAttribute('disabled', true));
        }
    }

    redirectToSavedFormInfo(id) {
        location.hash = `#/saved/${id}`;
    }

    deleteSupplier(deleteSupplierButton, suppliersNumberBox) {
        deleteSupplierButton.parentNode.parentNode.remove();

        const suppliersArr = [...document.getElementsByClassName('product__supplier')],
            suppliersQty = suppliersArr.length;

        for (let i = 0; i < suppliersQty; i++) {
            suppliersArr[i].dataset.supplier = i + 1;
        }

        suppliersNumberBox.value = suppliersQty;
    }

    deleteProduct(deleteProductButton, productsNumberBox) {
        let productNumber = deleteProductButton.parentNode.dataset.product;
        const productCellsToDeleteArr = [...document.querySelectorAll(`[data-product = "${productNumber}"]`)];

        productCellsToDeleteArr.forEach(val => val.remove());

        const columnArr = [...document.getElementsByClassName('column')],
            productsQty = document.getElementsByClassName('column')[0].getElementsByClassName('row-product').length;

        productsNumberBox.value = productsQty;

        columnArr.forEach(val => {
            const productCellArr = [...val.querySelectorAll('[data-product]')],
                productsNumberElemArr = [...document.getElementsByClassName('product-number')];

            for (let i = 0; i < productsQty; i++) {
                productCellArr[i].dataset.product = i + 1;
                productsNumberElemArr[i].innerHTML = i + 1;
            }
        });
    }

    getCustomsDutyRateFromTariff(tariffInput, dutiesInput) {
        let tariffValue = tariffInput.value;

        if (!(/^[0-9]{10}$/.test(tariffValue))) {
            tariffInput.parentNode.getElementsByClassName('error-JS')[0] && tariffInput.parentNode.getElementsByClassName('error-JS')[0].remove();
        }

        if (/^[0-9]{10}$/.test(tariffValue)) {
            this.getCustomsDutiesFromServer(tariffValue).then(rate => {
                if (rate.match(/<b>[0-9]{10}<\/b>/)) {
                    let customsDuties = rate.slice(rate.indexOf('duty_value'), rate.indexOf('duty_value') + 20).match(/[0-9]{1,2}(.[0-9]{1,3})?/),
                        customsDutiesValue = customsDuties ? customsDuties[0] : '0';

                    dutiesInput.value = customsDutiesValue;

                    Utils.validateInputValue(dutiesInput, 5);
                }
                if (!rate.match(/<b>[0-9]{10}<\/b>/)) {

                    dutiesInput.value = '';

                    !tariffInput.parentNode.getElementsByClassName('error-JS').length && tariffInput.parentNode.insertAdjacentHTML('beforeEnd', '<span class="error-JS">Указанный код не существует</span>');

                    Utils.validateInputValue(dutiesInput, 5);
                }
            }).catch(() => this.addErrorMessage(tariffInput, dutiesInput));
        }

    }

    getCustomsDutiesFromServer(tariffValue) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', `http://www.tks.ru/db/tnved/tree/c${tariffValue}/show/ajax`, true);

            xhr.onerror = () => {
                reject();
            };

            xhr.onload = () => {
                try {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject();
                    }
                } catch (e) {
                    reject();
                }
            };
            xhr.send();
        });
    }

    addErrorMessage(tariffInput, dutiesInput) {
        !(tariffInput.parentNode.getElementsByClassName('server-error')[0]) && tariffInput.parentNode.insertAdjacentHTML('beforeEnd', '<span class="error-JS server-error">Ошибка связи с сервером. Повторите попытку ввода или заполните поле таможенная пошлина самостоятельно.</span>');
        tariffInput.value = '';
        dutiesInput.value = '';

        Utils.validateInputValue(dutiesInput, 5);
        Utils.validateInputValue(tariffInput, 5);

        dutiesInput.hasAttribute('disabled') && dutiesInput.removeAttribute('disabled', true);
    }

    adoptSuppliersNumber(suppliersNumberBox) {
        const productSuppliersActualArr = document.getElementsByClassName('product__supplier');
        let requestedSuppliersNumber = +suppliersNumberBox.value,
            productSuppliersActualQty = document.getElementsByClassName('product__supplier').length,
            differenceInSuppliersQty = requestedSuppliersNumber - productSuppliersActualQty;

        if (requestedSuppliersNumber && differenceInSuppliersQty > 0) {
            for (let i = productSuppliersActualQty; i < requestedSuppliersNumber; i++) {
                this.addSupplierHTML(i);

                const newSupplier = [...productSuppliersActualArr].filter(val => val.dataset.supplier == (i + 1))[0],
                    inputsArr = [...newSupplier.getElementsByClassName('form__elem-value')];

                inputsArr.forEach(val => val.classList.add('error-style'));
            }
        } else if (requestedSuppliersNumber && differenceInSuppliersQty < 0) {
            for (let i = productSuppliersActualQty; i > requestedSuppliersNumber; i--) {
                productSuppliersActualArr[i - 1].remove();
            }
        }
    }

    adoptProductsNumber(productsNumberBox) {
        const actualProductsColl = document.getElementsByClassName('row-product'),
            productsActualQty = document.getElementsByClassName('product__supplier')[0].getElementsByClassName('row-product').length,
            productCellsCollection = document.querySelectorAll('[data-product]'),
            productCellsArr = [...productCellsCollection];
        let requestedProductsNumber = +productsNumberBox.value,
            differenceInProductsNumber = requestedProductsNumber - productsActualQty;

        if (requestedProductsNumber && differenceInProductsNumber > 0) {
            for (let i = productsActualQty; i < requestedProductsNumber; i++) {
                this.addProductHTML(i);

                const newProductCellsArr = [...actualProductsColl].filter(val => val.dataset.product == i + 1);

                for (let i = 0; i < newProductCellsArr.length; i++) {
                    const inputsArr = [...newProductCellsArr[i].getElementsByClassName('form__elem-value')];

                    inputsArr.forEach(val => val.classList.add('error-style'));
                }
            }
        } else if (requestedProductsNumber && differenceInProductsNumber < 0) {
            for (let i = productsActualQty; i > requestedProductsNumber; i--) {
                productCellsArr.filter(val => val.dataset.product == i).forEach(val => val.remove());
            }
        }
    }

    addSupplierHTML(index) {
        const tableBox = document.getElementsByClassName('table')[0],
            deleteColumn = tableBox.children[tableBox.children.length - 1],
            supplierProductsHTML = this.adoptProductNumberHTML(),
            supplierNameHTML = supplierNameTemplate(),
            supplierConditionsHTML = supplierConditionsTemplate(),
            supplierHTML = `
                <div class="column product__supplier" data-supplier ="${index + 1}">
                    ${[supplierNameHTML, supplierProductsHTML, supplierConditionsHTML].join('\n')}
                </div>`;

        deleteColumn.insertAdjacentHTML('beforeBegin', supplierHTML);
    }

    adoptProductNumberHTML() {
        let productsActualQty = document.getElementsByClassName('product__supplier')[0].getElementsByClassName('row-product').length,
            productsHTMLArr = [];

        for (let i = 0; i < productsActualQty; i++) {
            let elem = this.insertProductHTML(i);
            productsHTMLArr.push(elem);
        }

        return productsHTMLArr.join('\n');
    }

    insertProductHTML(index) {
        let ind = index + 1;
        return productPriceCellTemplate({ind});
    }

    addProductHTML(index) {
        let ind = index + 1;
        const productInitialInfoCellHTML = productInitialInfoTemplate({ind}),
            productSupplierInfoHTML = productPriceCellTemplate({ind}),
            productDeleteHTML = deleteBtnTemplate({ind}),
            paymentRowElements = document.getElementsByClassName('row-payment'),
            paymentRowElementsArr = [...paymentRowElements];
        let suppliersQty = paymentRowElements.length - 2,
            productSupplierInfoArr = [];

        for (let i = 0; i < suppliersQty; i++) {
            productSupplierInfoArr.push(productSupplierInfoHTML);
        }

        const productRowElementsArr = [productInitialInfoCellHTML, ...productSupplierInfoArr, productDeleteHTML];

        paymentRowElementsArr.forEach((val, i) => val.insertAdjacentHTML('beforeBegin', productRowElementsArr[i]));
    }

    addPaymentDescriptionHTML(target) {
        const paymentDescriptionBox = target.parentNode.children[1];

        paymentDescriptionBox.innerHTML = paymentTermsTemplate({target});

        [...paymentDescriptionBox.getElementsByClassName('form__elem-value')].forEach(val =>
            val.classList.add('error-style'));
    }
}

const parametersSettings = new Parameters();

export default parametersSettings;