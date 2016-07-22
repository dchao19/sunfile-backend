var express = require('express');
var router = express.Router();
var cors = require('cors');

router.use(cors({
    origin: ["null", "http://localhost:8081"],
    credentials: true,
    methods: ['GET', 'POST']
}));

router.options('*', cors({
    origin: ["null", "http://localhost:8081"],
    credentials: true,
    methods: ['GET', 'POST']
}));

// UNAUTHENTICATED ROUTES
router.get('/', function(req, res) {
    res.json({message: "API v1 OK!"});
});


/* ********************
  AUTHENTICATED ROUTES
**********************/


module.exports = router;
