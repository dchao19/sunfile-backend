var express = require('express');
var router = express.Router(); // eslint-disable-line

var Team = require('../models/Team');
var Article = require('../models/Article');

var requiresLogin = require('../utils/requiresLogin');
var StatUtils = require('../utils/statUtils');

router.use(requiresLogin);

router.get('/user', (req, res) => {
    res.json({
        success: true,
        message: 'success',
        result: req.user
    });
});

router.get('/team', async (req, res) => {
    if (typeof req.user._json.user_metadata === 'undefined') {
        return res.json({
            success: true,
            message: 'success'
        });
    }
    let team = await Team.findOne({id: req.user._json.user_metadata.teamCode});
    if (!team) {
        return res.json({
            success: false,
            message: 'not-found-error',
            errorCode: 3,
            errMessage: 'The user\'s team could not be found'
        });
    }
    res.json({
        success: true,
        message: 'success',
        result: team
    });
});

router.get('/stats', async function (req, res) {
    try {
        let statUtils = new StatUtils();
        let teamCode = typeof req.user._json.user_metadata === 'undefined' ? 'UNDEFINED' : req.user._json.user_metadata.teamCode;
        let team = await Team.findOne({id: teamCode});
        if (!team) {
            return res.json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }

        let teamArticles = await Article.find({teamID: teamCode});
        let userArticles = await Article.find({user: req.user.emails[0].value});
        let userCharts = await statUtils.generateData(userArticles, "My Articles");
        let teamCharts = await statUtils.generateData(teamArticles, "Team Articles");
        res.json({
            success: true,
            message: 'success',
            result: {
                infoStats: {
                    myNumArticles: userArticles.length,
                    teamNumArticles: teamArticles.length
                },
                mySourcesPie: userCharts.pie,
                myArticlesLine: userCharts.line,
                teamSourcesPie: teamCharts.pie,
                teamArticlesLine: teamCharts.line,
                teamStats: team.users
            }
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

module.exports = router;