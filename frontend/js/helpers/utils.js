class Utils {
    static parseRequestURL() {
        const url = location.hash.slice(2),
            request = {};

        [request.resource, request.id] = url.split('/');

        return request;
    }

    static validateInputValue(inputElem, ind) {
        let inputValue = inputElem.value.trim(),
            parameter1;

        switch (ind) {
            case 1:
                parameter1 = /^(0||([1-9]([0-9]+)?))(\.[0-9]+)?$/.test(inputValue);
                break;
            case 2:
                parameter1 = /^[0-9]{10}$/.test(inputValue);
                break;
            case 3:
                parameter1 = /^[0-9]{1,3}$/.test(inputValue);
                break;
            case 4:
                parameter1 = /^[а-яёa-z]+([2-3])?$/i.test(inputValue);
                break;
            case 5:
                parameter1 = 1;
                break;
        }

        if (!parameter1 || !inputValue) {
            !(inputElem.classList.contains('error-style')) && inputElem.classList.add('error-style');

            inputElem.classList.contains('approved-style') && inputElem.classList.remove('approved-style');
        } else {
            inputElem.classList.contains('error-style') && inputElem.classList.remove('error-style');

            !(inputElem.classList.contains('approved-style')) && inputElem.classList.add('approved-style');
        }
    }
}

export default Utils;