const express = require('express'),
    router = express.Router(),
    config = require('config'),
    fs = require('file-system');

router.get('/api/forms', (req, res) => {
    res.send(fs.readFileSync(config.get('jsonForms'), 'utf8'));
});

module.exports = router;