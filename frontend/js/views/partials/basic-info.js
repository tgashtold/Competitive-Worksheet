import Utils from '../../helpers/utils';
import infoBoxErrorTemplate from '../../../templates/partials/infobox-error';

class BasicInfo {
    setActions() {
        const editBasicInfoBtn = document.getElementsByClassName('button-editAside')[0],
            basicInfoInputArr = document.getElementsByClassName('section-item__value');

        editBasicInfoBtn.addEventListener('click', () => {
            if (editBasicInfoBtn.dataset.state === 'edit-aside') {
                document.getElementsByClassName('error-JS')[0] && document.getElementsByClassName('error-JS')[0].remove();

                for (let val of basicInfoInputArr) {
                    Utils.validateInputValue(val, 1);
                    val.removeAttribute('disabled');
                }

                editBasicInfoBtn.dataset.state = 'save';
                editBasicInfoBtn.textContent = 'Сохранить';

                editBasicInfoBtn.parentNode.insertAdjacentHTML('beforeEnd', '<button class="save-window__button" data-state="default-values">' +
                    'Значения по умолчанию</button>');

                const defaultValueBtn = document.querySelector('[data-state="default-values"]');

                defaultValueBtn.onclick = () => {
                    this.setDefaultBasicInfo();
                    this.stopEdition(editBasicInfoBtn, basicInfoInputArr);
                };
            } else {
                let counter = 0;

                for (let val of basicInfoInputArr) {
                    Utils.validateInputValue(val, 1);
                    val.classList.contains('error-style') && ++counter;
                }

                if (counter > 0) {
                    alert('Поля должны содержать дробное или целое числовое значение. Допустимые символы: числа от 0 до 9 и точка');
                } else {
                    this.stopEdition(editBasicInfoBtn, basicInfoInputArr);
                }
            }
        });
    }

    stopEdition(editBasicInfoBtn, basicInfoInputArr) {
        editBasicInfoBtn.dataset.state = 'edit-aside';
        editBasicInfoBtn.textContent = 'Редактировать';

        for (let val of basicInfoInputArr) {
            val.classList.remove('approved-style');
            val.setAttribute('disabled', true);
        }

        document.querySelector('[data-state="default-values"]').remove();
    }

    setDefaultBasicInfo() {
        const defaultBasicInfo = {
            depositRate: {
                BYN: '7.45',
                EUR: '0.3',
                USD: '0.6',
                RUB: '4.125'
            },
            baseRate: '25.5'
        };

        this.setExchangeRates();

        document.querySelector('[data-deposit_currency = "BYN"]').value = defaultBasicInfo.depositRate.BYN;
        document.querySelector('[data-deposit_currency = "EUR"]').value = defaultBasicInfo.depositRate.EUR;
        document.querySelector('[data-deposit_currency = "USD"]').value = defaultBasicInfo.depositRate.USD;
        document.querySelector('[data-deposit_currency = "RUB"]').value = defaultBasicInfo.depositRate.RUB;
        document.querySelector('[data-content = "base-rate"]').value = defaultBasicInfo.baseRate;

        this.insertCurrentDate(document.getElementsByClassName('section-title__date')[0]);
        this.insertCurrentMonth(document.getElementsByClassName('section-title__month')[0]);
    }

    setBasicInfo(infoObj) {
        document.querySelector('[data-exchanged_currency = "EUR"]').value = infoObj.exchangeRate.EUR;
        document.querySelector('[data-exchanged_currency = "USD"]').value = infoObj.exchangeRate.USD;
        document.querySelector('[data-exchanged_currency = "RUB"]').value = infoObj.exchangeRate.RUB;
        document.querySelector('[data-deposit_currency = "BYN"]').value = infoObj.depositRate.BYN;
        document.querySelector('[data-deposit_currency = "EUR"]').value = infoObj.depositRate.EUR;
        document.querySelector('[data-deposit_currency = "USD"]').value = infoObj.depositRate.USD;
        document.querySelector('[data-deposit_currency = "RUB"]').value = infoObj.depositRate.RUB;
        document.querySelector('[data-content = "base-rate"]').value = infoObj.baseRate;
        document.getElementsByClassName('section-title__date')[0].textContent = infoObj.date;
        document.getElementsByClassName('section-title__month')[0].textContent = infoObj.rateMonth;
    }

    getBasicInfoValues() {
        return {
            exchangeRate: {
                EUR: +document.querySelector('[data-exchanged_currency = "EUR"]').value,
                USD: +document.querySelector('[data-exchanged_currency = "USD"]').value,
                RUB: +document.querySelector('[data-exchanged_currency = "RUB"]').value
            },
            depositRate: {
                BYN: +document.querySelector('[data-deposit_currency = "BYN"]').value,
                EUR: +document.querySelector('[data-deposit_currency = "EUR"]').value,
                USD: +document.querySelector('[data-deposit_currency = "USD"]').value,
                RUB: +document.querySelector('[data-deposit_currency = "RUB"]').value
            },
            baseRate: +document.querySelector('[data-content = "base-rate"]').value,
            date: document.getElementsByClassName('section-title__date')[0].textContent,
            rateMonth: document.getElementsByClassName('section-title__month')[0].textContent
        };
    }

    insertCurrentDate(box) {
        const currentDate = new Date();

        box.innerHTML = currentDate.toLocaleDateString();
    }

    insertCurrentMonth(box) {
        const currentDate = new Date(),
            monthsArr = 'январе,феврале,марте,апреле,мае,июне,июле,августе,сентябре,ноябре,декабре'.split(',');

        box.innerHTML = monthsArr[currentDate.getMonth()];
    }

    setExchangeRates() {
        const boxForUSDExchangeRate = document.querySelector('[data-exchanged_currency = "USD"]'),
            boxForEURExchangeRate = document.querySelector('[data-exchanged_currency = "EUR"]'),
            boxForRUBExchangeRate = document.querySelector('[data-exchanged_currency = "RUB"]'),
            exchangeRateDataBox = document.getElementsByClassName('section')[0];

        this.getExchangeRatesFromServer().then(currencyRateArr => {
            const currencyRateUSD = currencyRateArr.find(val => val.Cur_Abbreviation === 'USD').Cur_OfficialRate,
                currencyRateEUR = currencyRateArr.find(val => val.Cur_Abbreviation === 'EUR').Cur_OfficialRate,
                currencyRateRUB = currencyRateArr.find(val => val.Cur_Abbreviation === 'RUB').Cur_OfficialRate;

            boxForUSDExchangeRate.value = currencyRateUSD;
            boxForEURExchangeRate.value = currencyRateEUR;
            boxForRUBExchangeRate.value = (currencyRateRUB / 100).toFixed(6);
        }).catch(() => this.addErrorMessage(exchangeRateDataBox));

    }

    getExchangeRatesFromServer() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', 'http://www.nbrb.by/API/ExRates/Rates?Periodicity=0', true);

            xhr.onerror = () => {
                reject();
            };

            xhr.onload = () => {
                try {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
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

    addErrorMessage(box) {
        box.innerHTML += `${infoBoxErrorTemplate()}`;
    }

}

const basicInfoObj = new BasicInfo();

export default basicInfoObj;