var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

router.get('/quietfailure', (req, res) => {
    res.send({
        success: true,
        message: 'success',
        result: {
            authenticated: false
        }
    });
});

router.get('/loudfailure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'unauthorized',
        errCode: -100,
        errMessage: "You are not logged in."
    });
});

router.get('/verify',
    passport.authenticate('jwt', {
        session: false,
        failureRedirect: '/api/auth/quietfailure'
    }), function(req, res) {
        res.json({
            success: true,
            message: 'success',
            result: {
                authenticated: true,
                user: req.user
            }
        });
    });

module.exports = router;
