var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line
var path = require('path');

router.get('/callback',
    passport.authenticate('auth0'),
    function(req, res) {
        if (req.user) {
            res.render('authcallback');
        } else {
            throw new Error('user null');
        }
    }
);

router.get('/verify', function(req, res) {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            message: 'success',
            result: {
                authenticated: true,
                user: req.user
            }
        });
    } else {
        res.json({
            success: true,
            message: 'success',
            result: {
                authenticated: false
            }
        });
    }
});

module.exports = router;
