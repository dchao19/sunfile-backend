var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

var Team = require('../models/Team');
var TeamUserData = require('../models/TeamUserData');

var Utils = require('../utils/utils');
var utils = new Utils();

router.use(passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/api/auth/loudfailure'
}));

router.post('/new', async function(req, res) {
    try {
        if (!req.body.schoolName) {
            return res.status(400).json({
                success: false,
                message: 'missing-data-error',
                errorCode: 4,
                errMessage: "The schoolName property was not specified with the request. This is a required parameter"
            });
        }
        let teamCode = await utils.generateAndVerifyTeamCode();
        let existingTeam = await Team.findOne({schoolName: req.body.schoolName});
        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: 'already-exists-error',
                errorCode: 1,
                errMessage: 'This school already exists.'
            });
        }

        var newTeam = new Team({
            contactEmail: req.body.contactEmail,
            schoolName: req.body.schoolName,
            id: teamCode,
            users: [req.user._id]
        });

        newTeam.save();

        res.json({
            success: true,
            message: 'success',
            result: newTeam
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'server-error',
            errorCode: 0,
            errMessage: 'An internal server error has occured.'
        });
    }
});

router.post('/join', async function(req, res) {
    try {
        let team = await Team.findOne({id: req.body.teamCode});
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'not-found-error',
                errorCode: 2,
                errMessage: 'The team with the given team ID does not exist.'
            });
        }

        team.users.push(req.user._id);
        team.save();

        res.json({
            success: true,
            message: 'success',
            result: team
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'server-error',
            errorCode: 0,
            errMessage: 'An internal server error has occured.'
        });
    }
});

module.exports = router;
