const express = require('express'),
    router = express.Router(),
    config = require('config'),
    fs = require('file-system'),
    shortId = require('shortid');

router.post('/api/form', (req, res) => {
    const data = getFormsFromDB(),
        form = req.body;

    form.id = shortId.generate();

    data.push(form);
    setFormsToDB(data);

    res.send(form);
});

router.get('/api/form/:id', (req, res) => {
    const data = getFormsFromDB(),
        form = data.find(form => form.id === req.params.id);

    form ? res.send(form) : res.send({});
});

router.put('/api/form/:id/:newTitle', (req, res) => {
    let data = getFormsFromDB(),
        formForEdit = data.find(form => form.id == req.params.id);

    formForEdit.title = req.params.newTitle;
    setFormsToDB(data);

    res.sendStatus(204);
});


router.put('/api/form/:id', (req, res) => {
    let data = getFormsFromDB(),
        forms = data.filter(form => form.id !== req.params.id);

    forms.push(req.body);
    setFormsToDB(forms);

    res.sendStatus(204);
});

router.delete('/api/form/:id', (req, res) => {
    const data = getFormsFromDB(),
        updatedData = data.filter(form => form.id !== req.params.id);

    setFormsToDB(updatedData);

    res.sendStatus(204);
});

function getFormsFromDB() {
    return JSON.parse(fs.readFileSync(config.get('jsonForms'), 'utf8'));
}

function setFormsToDB(data) {
    fs.writeFileSync(config.get('jsonForms'), JSON.stringify(data));
}

module.exports = router;