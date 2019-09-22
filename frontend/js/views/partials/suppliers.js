import basicInfoObj from './basic-info';

class Supplier {
    getBestSupplier() {
        const suppliers = this.getAllSuppliersArr(),
            productRelatedCellsArr = [...document.getElementsByClassName('row-product')],
            productCellsArr = productRelatedCellsArr.filter(val => val.parentNode.classList.contains('product__supplier'));

        if (document.querySelector('[data-content="comparison-type"]').checked) {
            const allSuppliersTotalCostArr = suppliers.map(val => val.totalCost),
                minCost = Math.min(...allSuppliersTotalCostArr),
                bestSupplier = suppliers[allSuppliersTotalCostArr.indexOf(minCost)];

            productCellsArr.forEach(val => {
                    if (val.parentNode.dataset.supplier == bestSupplier.number) {
                        !(val.classList.contains('best')) && val.classList.add('best');
                    } else {
                        val.classList.contains('best') && val.classList.remove('best');
                    }
                }
            );

            return {
                bestSupplier: bestSupplier.name,
                index: bestSupplier.number,
                purchaseAmount: this.getPurchaseAmount(bestSupplier),
                currency: bestSupplier.product_1.currency,
                savings: this.getSavings(minCost, allSuppliersTotalCostArr, 1),
                savingsPersant: this.getSavings(minCost, allSuppliersTotalCostArr, 2)
            };

        } else {
            const productsNumber = suppliers[0].productsNumber,
                eachProductCostArr = [];

            for (let i = 1; i <= productsNumber; i++) {
                eachProductCostArr.push(suppliers.map(val => val[`product_${i}`].productCost));
            }

            const minCostSupplierIndexArr = eachProductCostArr.map(val => val.indexOf(Math.min(...val))),
                minProductsCostArr = eachProductCostArr.map(val => Math.min(...val)),
                totalCostsOfEachProductAtAllSuppl = [];

            for (let i = 0; i < eachProductCostArr[0].length; i++) {
                totalCostsOfEachProductAtAllSuppl.push(eachProductCostArr.reduce((res, val) => res + val[i], 0));
            }

            let totalSavings = this.getSavings(minProductsCostArr.reduce((res, val) => res + val, 0), totalCostsOfEachProductAtAllSuppl, 1),
                totalSavingPersant = this.getSavings(minProductsCostArr.reduce((res, val) => res + val, 0), totalCostsOfEachProductAtAllSuppl, 2);


            const cheapestProductsAndSuppliersArr = minCostSupplierIndexArr.map((val, i) => ({
                productNumber: i + 1,
                productName: suppliers[val][`product_${i + 1}`].name,
                supplierName: suppliers[val].name,
                supplierNumber: suppliers[val].number,
                amount: suppliers[val][`product_${i + 1}`].price * suppliers[val][`product_${i + 1}`].quantity,
                currency: suppliers[val][`product_${i + 1}`].currency
            }));

            productCellsArr.forEach(val => val.classList.contains('best') && val.classList.remove('best'));

            productCellsArr.forEach(val => {
                    for (let i = 0; i < cheapestProductsAndSuppliersArr.length; i++) {
                        if (val.parentNode.dataset.supplier == cheapestProductsAndSuppliersArr[i].supplierNumber && val.dataset.product == cheapestProductsAndSuppliersArr[i].productNumber) {
                            !(val.classList.contains('best')) && val.classList.add('best');
                        }

                    }
                }
            );
            return [...cheapestProductsAndSuppliersArr, {totalSavings, totalSavingPersant}];
        }
    }

    getPurchaseAmount(supplierInfo) {
        let purchaseAmount = 0;

        for (let i = 1; i <= supplierInfo.productsNumber; i++) {
            purchaseAmount = purchaseAmount + supplierInfo[`product_${i}`].price * supplierInfo[`product_${i}`].quantity;
        }
        return this._roundValue(purchaseAmount);
    }

    getSavings(minCost, allSuppliersTotalCostArr, index) {
        let allSuppliersCostAmount = allSuppliersTotalCostArr.reduce((res, val) => res + val, 0),
            averageCost = allSuppliersCostAmount / allSuppliersTotalCostArr.length;

        switch (index) {
            case 1:
                return this._roundValue(averageCost - minCost);
            case 2:
                return this._roundValue(((averageCost - minCost) / minCost) * 100);
        }
    }

    getAllSuppliersArr() {
        const suppliersNumber = +document.querySelector('[data-content="suppliers-number"]').value,
            suppliers = [];

        for (let i = 1; i <= suppliersNumber; i++) {
            suppliers.push(this.getSupplierInfo(i));
        }
        return suppliers;
    }

    getSupplierInfo(index) {
        const supplierBox = [...document.getElementsByClassName('product__supplier')].filter(val => val.dataset.supplier == index)[0],
            supplierInfo = {
                number: index,
                name: this.setSupplierName(supplierBox, index),
                payment: this.addPaymentConditionInfo(supplierBox),
                productsNumber: +document.querySelector('[data-content="products-number"]').value,
                delivery: {
                    cost: +supplierBox.getElementsByClassName('product-delivery')[0].value,
                    currency: supplierBox.getElementsByClassName('row-delivery')[0].getElementsByClassName('currency')[0].value.trim()
                },
                extras: {
                    cost: +supplierBox.getElementsByClassName('product-extras')[0].value,
                    currency: supplierBox.getElementsByClassName('row-extras')[0].getElementsByClassName('currency')[0].value.trim()
                },
                totalCost: 0
            };

        this.addProductsInfo(supplierBox, supplierInfo);
        this.addPaymentConditionInfo(supplierBox);
        this.calculateCosts(supplierInfo);

        return supplierInfo;
    }

    setSupplierName(supplierBox, index) {
        const supplierName = supplierBox.getElementsByClassName('product__supplier-name')[0].value.trim();

        return supplierName ? supplierName : `Поставщик ${index}`;
    }

    calculateCosts(supplierInfo) {
        const basicInfo = basicInfoObj.getBasicInfoValues();

        let allProductsValue = 0;

        for (let i = 1; i <= supplierInfo.productsNumber; i++) {
            allProductsValue = allProductsValue + this.getAmountInBYN(supplierInfo[`product_${i}`].price, supplierInfo[`product_${i}`].currency, basicInfo) * supplierInfo[`product_${i}`].quantity;
        }

        for (let i = 1; i <= supplierInfo.productsNumber; i++) {
            const product = supplierInfo[`product_${i}`];

            let productAmount = this.getAmountInBYN(product.price, product.currency, basicInfo) * product.quantity,
                productDeliveryCost = this.getAmountInBYN(supplierInfo.delivery.cost, supplierInfo.delivery.currency, basicInfo) / allProductsValue * productAmount,
                customsDuties = (productAmount + 0.8 * productDeliveryCost) * (product.customsRate / 100),
                paymentCost = productAmount * (supplierInfo.payment.prepaymentPersant / 100) * supplierInfo.payment.prepaymentDays * (this.getDepositRate(product.currency, basicInfo) / 365) - productAmount * (supplierInfo.payment.postpaymentPersant / 100) * supplierInfo.payment.postpaymentDays * (this.getDepositRate(product.currency, basicInfo) / 365),
                productExtraCost = (this.getAmountInBYN(supplierInfo.extras.cost, supplierInfo.extras.currency, basicInfo) / allProductsValue) * productAmount;

            product.productCost = this._roundValue(productAmount + productDeliveryCost + customsDuties + paymentCost + productExtraCost);
        }

        let totalCosts = 0;

        for (let i = 1; i <= supplierInfo.productsNumber; i++) {
            totalCosts = totalCosts + supplierInfo[`product_${i}`].productCost;
        }

        supplierInfo.totalCost = this._roundValue(totalCosts);
    }

    getDepositRate(currency, basicInfo) {
        switch (currency) {
            case 'BYN':
                return basicInfo.depositRate.BYN / 100;
            case 'EUR':
                return basicInfo.depositRate.EUR / 100;
            case 'USD':
                return basicInfo.depositRate.USD / 100;
            case 'RUB':
                return basicInfo.depositRate.RUB / 100;
        }
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

    addPaymentConditionInfo(supplierBox) {
        let paymentCond = supplierBox.getElementsByClassName('payment')[0].value.trim(),
            prepaymentPersant,
            prepaymentDays,
            postpaymentPersant,
            postpaymentDays;

        switch (paymentCond) {
            case 'postpayment':
                prepaymentPersant = 0;
                prepaymentDays = 0;
                postpaymentPersant = 100;
                postpaymentDays = +supplierBox.getElementsByClassName('postpayment-value')[0].value;
                break;
            case 'prepayment':
            case 'l/c':
                prepaymentPersant = 100;
                prepaymentDays = +supplierBox.getElementsByClassName('prepayment-value')[0].value;
                postpaymentPersant = 0;
                postpaymentDays = 0;
                break;
            case 'part-payment':
                prepaymentPersant = +supplierBox.getElementsByClassName('prepayment-rate')[0].value;
                prepaymentDays = +supplierBox.getElementsByClassName('prepayment-value')[0].value;
                postpaymentPersant = +supplierBox.getElementsByClassName('postpayment-rate')[0].value;
                postpaymentDays = +supplierBox.getElementsByClassName('postpayment-value')[0].value;
                break;
            case 'default':
                prepaymentPersant = 0;
                prepaymentDays = 0;
                postpaymentPersant = 0;
                postpaymentDays = 0;
                break;
        }

        return {
            paymentCond,
            prepaymentPersant,
            prepaymentDays,
            postpaymentPersant,
            postpaymentDays
        };

    }

    addProductsInfo(supplierBox, supplierInfo) {
        for (let i = 0; i < supplierInfo.productsNumber; i++) {
            supplierInfo[`product_${i + 1}`] = {
                name: document.querySelectorAll(`[data-product="${i + 1}"]`)[0].getElementsByClassName('product-name')[0].value,
                quantity: +document.querySelectorAll(`[data-product="${i + 1}"]`)[0].getElementsByClassName('product-quantity')[0].value,
                measureUnit: document.querySelectorAll(`[data-product="${i + 1}"]`)[0].getElementsByClassName('product-measurement')[0].value,
                price: +supplierBox.querySelector(`[data-product="${i + 1}"]`).getElementsByClassName('product-price')[0].value,
                currency: supplierBox.querySelector(`[data-product="${i + 1}"]`).getElementsByClassName('currency')[0].value.trim(),
                customsRate: +supplierBox.querySelector(`[data-product="${i + 1}"]`).getElementsByClassName('product-duties')[0].value,
                customsCode: supplierBox.querySelector(`[data-product="${i + 1}"]`).getElementsByClassName('product-tariff')[0].value,
                productCost: 0
            };
        }

    }

    _roundValue(value) {
        return +((value).toFixed(2));
    }
}

const suppliers = new Supplier();

export default suppliers;
