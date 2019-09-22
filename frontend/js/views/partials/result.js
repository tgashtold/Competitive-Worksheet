import basicInfoObj from './basic-info';
import suppliers from './suppliers';
import totalAmountComparisonResultTemplate from '../../../templates/partials/result-total-amount-comparison';
import tenderWarningTemplate from '../../../templates/partials/tender-warning';

class Result {
    setActions() {
        const resultButton = document.getElementsByClassName('button-result')[0],
            resultBox = document.getElementsByClassName('result')[0],
            comparisonTypeValue = document.querySelector('[data-content="comparison-type"]'),
            productsNumberBox = document.querySelector('[data-content="products-number"]'),
            suppliersNumberBox = document.querySelector('[data-content="suppliers-number"]'),
            tableBox = document.getElementsByClassName('table')[0];
        let calcValueArr;

        productsNumberBox.addEventListener('keyup', () => {
            this.setBehaviorOfResultBtn(resultButton, resultBox);
        });

        suppliersNumberBox.addEventListener('keyup', () => {
            this.setBehaviorOfResultBtn(resultButton, resultBox);
        });

        resultBox.addEventListener('click', (event) => {
            const showCalculationBtn = document.getElementsByClassName('button-amount')[0];

            if (event.target == showCalculationBtn) {
                showCalculationBtn.parentNode.insertAdjacentHTML('beforeBegin', `${this.showCostsTable()}`);

                calcValueArr = [...document.getElementsByClassName('counts-row__product-cost'), ...document.getElementsByClassName('counts-row__total-cost')].map(val => +val.textContent.trim());

                showCalculationBtn.remove();
            }

            if (event.target.classList.contains('result-tax')) {
                const amount = +event.target.parentNode.getElementsByClassName('result-amount')[0].textContent.trim().match(/^[0-9]+\.[0-9]+/)[0],
                    currency = event.target.parentNode.getElementsByClassName('result-amount')[0].textContent.trim().match(/[A-Z]{3}/)[0],
                    VATRate = 1.2;

                event.target.parentNode.innerHTML = (event.target.textContent.trim() == 'учесть')
                    ? `Сумма закупки составляет <span class="result-amount ">${(amount * VATRate).toFixed(2)}${currency}</span>  c учетом НДС 20%  (<button class="result-tax ">вычесть</button>)` : `Сумма закупки составляет <span class="result-amount ">${(amount / VATRate).toFixed(2)} ${currency}</span> без учета НДС (<button class="result-tax ">учесть</button>)`;
            }
        });

        resultBox.addEventListener('change', (event) => {
            const calculationsCurrencyElem = document.getElementsByClassName('counts-currency')[0].getElementsByClassName('currency')[0];

            if (event.target == calculationsCurrencyElem) {
                this.convertCalculations(calcValueArr, event.target.value);
            }
        });

        resultButton.addEventListener('click', () => this.setChangeOfResultBtn(resultBox, resultButton));

        comparisonTypeValue.addEventListener('change', () => {
            if (resultButton.dataset.state == 'hide') {
                resultBox.innerHTML = this.showResult(suppliers.getBestSupplier());
            }
        });

        tableBox.addEventListener('keyup', () => {
            this.setBehaviorOfResultBtn(resultButton, resultBox);

            if (resultButton.dataset.state === 'hide') {
                resultBox.innerHTML = this.showResult(suppliers.getBestSupplier());

            }
        });

    }

    setBehaviorOfResultBtn(resultButton, resultBox) {
        const obligatoryInputsArr = [...document.getElementsByClassName('product-quantity'), ...document.getElementsByClassName('product-price')];

        if (obligatoryInputsArr.every(val => val.classList.contains('approved-style') && val.value != 0)) {
            resultButton.hasAttribute('disabled') && resultButton.removeAttribute('disabled');

            document.getElementsByClassName('result-warning')[0] && document.getElementsByClassName('result-warning')[0].remove();
        } else {
            !resultButton.hasAttribute('disabled') && resultButton.setAttribute('disabled', true);
            !document.getElementsByClassName('result-warning')[0] && resultButton.insertAdjacentHTML('beforeBegin', '<p class="error-JS result-warning">Для просмотра результата необходимо заполнить поля "цена за ед." и "количество". Значения не должны равняться 0.</p>');

            this.changeResultBtnToShow(resultBox, resultButton);
            this.removeBestResultMark();
        }
    }

    setChangeOfResultBtn(resultBox, resultButton) {
        const result = suppliers.getBestSupplier();

        switch (resultButton.dataset.state) {
            case 'hide':
                this.changeResultBtnToShow(resultBox, resultButton);
                this.removeBestResultMark();
                break;
            case 'show':
                resultButton.innerHTML = 'скрыть результат';
                resultButton.dataset.state = 'hide';
                resultBox.innerHTML = this.showResult(result);
        }
    }

    changeResultBtnToShow(resultBox, resultButton) {
        resultBox.innerHTML = '';
        resultButton.innerHTML = 'показать результат';
        resultButton.dataset.state = 'show';
    }

    removeBestResultMark() {
        const productRowsArr = [...document.getElementsByClassName('row-product')];

        productRowsArr.forEach(val => val.classList.contains('best') && val.classList.remove('best'));
    }

    showResult(result) {
        return `
            <h4 class="result-head">Результат</h4>
                ${document.querySelector('[data-content="comparison-type"]').checked ? this.getTotalAmountComparisonResHTML(result) : this.getMultiSupplierResultHTML(result)}
                ${this.informIfTender(result)}
            <div class="result-buttons">
                <button class="button button-amount" data-state="show ">показать расчеты</button>
            </div>`;
    }

    getMultiSupplierResultHTML(result) {
        const savings = result.pop(),
            rangedBySuppliersArr = [],
            suppliersNumber = +document.querySelector('[data-content="suppliers-number"]').value;

        for (let i = 1; i <= suppliersNumber; i++) {
            rangedBySuppliersArr.push(result.filter(val => val.supplierNumber == i));
        }

        const filteredBySupplierArr = rangedBySuppliersArr.filter(val => val.length);

        return `
            <div class="result-text__wrapper">
                ${filteredBySupplierArr.map(val => this.addBestSupplierResultHTML(val)).join('\n')}
                <p class="result-text savings-text"> Условная экономия составляет <span class="result-savings">${savings.totalSavings.toFixed(2)} BYN</span> или
                <span class="result-savings">${savings.totalSavingPersant.toFixed(2)} %</span></p>
            </div>`;
    }

    addBestSupplierResultHTML(supplierProductsArr) {
        return `
            <div class="result-text__wrapper">
                <p class="result-text">Закупку товарных позиций</p>
                <ul class="result-product">
                    ${this.addBestSupplierProductsHTML(supplierProductsArr)}
                </ul>
                <p class="result-text"> производить у <span class="result-supplier ">${supplierProductsArr[0].supplierName}</span> 
                </p>
                <p class="result-text result-text__amount">Сумма закупки составляет 
                    <span class="result-amount">${supplierProductsArr.reduce((res, val) => res + val.amount, 0).toFixed(2)}  
                    ${supplierProductsArr[0].currency}</span>  без учета НДС (<button class="result-tax">учесть</button>)
                </p>
            </div>`;
    }

    addBestSupplierProductsHTML(supplierProductsArr) {
        return supplierProductsArr.map(val => `<li class="result-product__item">товар ${val.productNumber} ${val.productName}</li>`).join('\n');
    }

    informIfTender(result) {
        const basicInfo = basicInfoObj.getBasicInfoValues();
        let amountInBasicUnit;

        if (document.querySelector('[data-content="comparison-type"]').checked) {
            amountInBasicUnit = this.getAmountInBYN(result.purchaseAmount, result.currency, basicInfo) / basicInfo.baseRate;
        }
        if (!document.querySelector('[data-content="comparison-type"]').checked) {
            const rangedBySuppliersArr = [];

            for (let i = 1; i <= +document.querySelector('[data-content="suppliers-number"]').value; i++) {
                rangedBySuppliersArr.push(result.filter(val => val.supplierNumber == i));
            }

            const filteredBySupplierArr = rangedBySuppliersArr.filter(val => val.length),
                supplierAmountArr = filteredBySupplierArr.map(val => this.getAmountInBYN(val.reduce((r, v) => r + v.amount, 0), val[0].currency, basicInfo));

            amountInBasicUnit = Math.max(...supplierAmountArr) / basicInfo.baseRate;
        }

        let procedureType;

        if (amountInBasicUnit >= 10000) {
            procedureType = 'bidding';
            return tenderWarningTemplate({procedureType});
        } else if (amountInBasicUnit >= 1000) {
            procedureType = 'priceRequest';
            return tenderWarningTemplate({procedureType});
        } else {
            return '';
        }
    }

    getTotalAmountComparisonResHTML(result) {
        result.purchaseAmount = result.purchaseAmount.toFixed(2);
        result.savings = result.savings.toFixed(2);
        result.savingsPersant = result.savingsPersant.toFixed(2);

        return totalAmountComparisonResultTemplate({result});
    }

    getAmountInBYN(amount, currency, basicInfo) {
        switch (currency) {
            case 'BYN':
                return amount;
            case 'EUR':
                return amount * basicInfo.exchangeRate.EUR;
            case 'USD':
                return amount * basicInfo.exchangeRate.USD;
            case 'RUB':
                return amount * basicInfo.exchangeRate.RUB;
        }
    }

    convertCalculations(calcValueArr, currency) {
        const calcElemArr = [...document.getElementsByClassName('counts-row__product-cost'), ...document.getElementsByClassName('counts-row__total-cost')];

        if (currency == 'BYN') {
            for (let i = 0; i < calcElemArr.length; i++) {
                calcElemArr[i].innerHTML = `${calcValueArr[i].toFixed(2)}`;
            }
        } else {
            const basicInfo = basicInfoObj.getBasicInfoValues(),
                calcValueInSelectedCurrencyArr = calcValueArr.map(val => this.convertFromBYN(val, currency, basicInfo).toFixed(2));

            for (let i = 0; i < calcElemArr.length; i++) {
                calcElemArr[i].innerHTML = `${calcValueInSelectedCurrencyArr[i]}`;
            }
        }
    }

    convertFromBYN(amount, currency, basicInfo) {
        switch (currency) {
            case 'EUR':
                return amount / basicInfo.exchangeRate.EUR;
            case 'USD':
                return amount / basicInfo.exchangeRate.USD;
            case 'RUB':
                return amount / basicInfo.exchangeRate.RUB;
        }
    }

    showCostsTable() {
        const suppliersArr = suppliers.getAllSuppliersArr();

        return `
            <div class="counts">
                <p class="counts-head">расчеты</p>
                <div class="counts-currency">
                    <span class="counts-currency__title">Валюта сравнения</span>
                    <select class="currency " name=" ">
                        <option class="currency-option" value="BYN" selected>BYN</option>
                        <option class="currency-option"  value="RUB">RUB</option>
                        <option class="currency-option"  value="USD">USD</option>
                        <option class="currency-option"  value="EUR">EUR</option>
                    </select>
                 </div>
                <table class="counts-table">
                    <tr class="counts-row__title">
                        <td class="counts-cell"></td>
                        ${this.addSupplierNameTD(suppliersArr)}
                    </tr>
                    ${this.addProductsCosts(suppliersArr)}
                    <tr class="counts-row__total">
                        <td class="counts-cell counts-row__total-text">Итого</td>
                        ${this.addSupplierTotalCostTD(suppliersArr)}
                    </tr>
                </table>
            </div>`;
    }

    addSupplierNameTD(suppliersArr) {
        return suppliersArr.map(val => `<td class="counts-cell counts-row__supplier-name">${val.name}</td>`).join('\n');
    }

    addProductsCosts(suppliersArr) {
        const productsNumber = suppliersArr[0].productsNumber,
            productsHTMLArr = [];

        for (let i = 0; i < productsNumber; i++) {
            productsHTMLArr.push(`
                <tr class="counts-row__product">
                    <td class="counts-cell counts-row__product-name">Товар ${i + 1}</td>
                    ${suppliersArr.map(val => `<td class="counts-cell counts-row__product-cost">${val[`product_${i + 1}`].productCost.toFixed(2)} </td>`).join('\n')}
                </tr>`);
        }
        return productsHTMLArr.join('\n');
    }

    addSupplierTotalCostTD(suppliersArr) {
        return suppliersArr.map(val => `<td class="counts-cell counts-row__total-cost">${val.totalCost.toFixed(2)}</td>`).join('\n');
    }
}

const resultObj = new Result();

export default resultObj;