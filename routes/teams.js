var express = require('express');
var router = express.Router(); // eslint-disable-line

var Team = require('../models/Team');
var TeamUserData = require('../models/TeamUserData');

var Utils = require('../utils/utils');
var utils = new Utils();
var requiresLogin = require('../utils/requiresLogin');

router.use(requiresLogin);

router.post('/new', async function(req, res) {
    try {
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

        var userData = new TeamUserData({
            firstName: req.user.given_name,
            lastName: req.user.family_name,
            numArticles: 0,
            email: req.user.emails[0].value
        });

        var newTeam = new Team({
            contactEmail: req.body.contactEmail,
            schoolName: req.body.schoolName,
            id: teamCode,
            users: userData
        });

        newTeam.save();
        await utils.updateUserTeamCode(req.user.id, teamCode);

        res.json({
            success: true,
            message: 'success',
            result: newTeam
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

        var userData = new TeamUserData({
            firstName: req.user.name.givenName,
            lastName: req.user.name.familyName,
            numArticles: 0,
            email: req.user.emails[0].value
        });
        team.users.push(userData);
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
