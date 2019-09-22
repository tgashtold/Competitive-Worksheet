class Forms {
    getSavedForms() {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', 'http://localhost:3000/api/forms', true);

            xhr.onload = () => resolve(JSON.parse(xhr.response));

            xhr.send();
        });
    }

    addForm(newForm) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', 'http://localhost:3000/api/form', true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(JSON.parse(xhr.response));

            xhr.send(JSON.stringify(newForm));
        });
    }

    getForm(id) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', `http://localhost:3000/api/form/${id}`, true);

            xhr.onload = () => resolve(JSON.parse(xhr.response));

            xhr.send();
        });
    }

    editFormTitle(id, newTitle) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('PUT', `http://localhost:3000/api/form/${id}/${newTitle}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve();

            xhr.send();
        });
    }

    editForm(updatedForm) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('PUT', `http://localhost:3000/api/form/${updatedForm.id}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve();

            xhr.send(JSON.stringify(updatedForm));
        });
    }

    deleteForm(id) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('DELETE', `http://localhost:3000/api/form/${id}`, true);

            xhr.onload = () => resolve();

            xhr.send();
        });
    }
 }

export default Forms;