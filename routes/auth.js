var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

router.get('/callback',
    passport.authenticate('auth0'),
    function(req, res) {
        if (req.user) {
            res.json({message: 'success'});
        } else {
            throw new Error('user null');
        }
    }
);

router.get('/verify', function(req, res) {
    if (req.isAuthenticated()) {
        res.json({message: "auth looks good!", result: req.user});
    } else {
        res.json({message: "auth no good."});
    }
});

module.exports = router;
