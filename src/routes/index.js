var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send('./views/index.html');
});

module.exports = router;
