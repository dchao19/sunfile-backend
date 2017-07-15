var express = require('express');
var passport = require('passport');
var router = express.Router();

var Source = require('../models/Source');

router.get('/', async function(req, res) {
    var sourcesShort = {};
    var sourcesLong = {};
    try {
        let sources = await Source.find({});
        for (var source of sources) {
            sourcesLong[source.host] = source.longName;
            sourcesShort[source.host] = source.shortName;
        }
        res.status(200).json({
            success: true,
            message: 'success',
            result: {
                sources: sourcesShort,
                sourcesFullName: sourcesLong,
                sourcesComplete: sources
            }
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

router.post('/new', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/api/auth/loudfailure'
}), async function (req, res) {
    try {
        let source = await Source.findOne({host: req.body.host});
        if (source) {
            return res.status(409).json({
                success: false,
                message: 'already-exists-error',
                errorCode: 1,
                errMessage: "This source already exists with the given host."
            });
        }

        let newSource = new Source({
            shortName: req.body.shortName,
            longName: req.body.longName,
            host: req.body.host
        });
        await newSource.save();

        res.json({
            success: true,
            message: 'success',
            result: newSource
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'server-error',
            errorCode: 0,
            errMessage: "An internal server error has occured."
        });
    }
});

module.exports = router;
