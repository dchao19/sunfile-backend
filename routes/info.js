var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

var Team = require('../models/Team');
var Article = require('../models/Article');

var StatUtils = require('../utils/statUtils');

router.use(passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/api/auth/loudfailure'
}));

router.get('/user', async (req, res) => {
    try {
        let team = await Team.findOne({teamCode: req.user.teamCode});
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }

        res.json({
            success: true,
            message: 'success',
            result: {
                user: req.user,
                team
            }
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

router.get('/team', async (req, res) => {
    let team = await Team.findOne({teamCode: req.user.teamCode});
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
        let team = await Team.findOne({teamCode: req.user.teamCode}).populate('users articles');
        if (!team) {
            return res.json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }

        let teamUsers = team.users.map((user) => {
            return {
                email: user.email,
                firstName: user.name.substring(0, user.name.indexOf(" ")),
                lastName: user.name.substring(user.name.indexOf(" ") + 1),
                numArticles: user.numArticles
            };
        });

        let userArticles = await Article.find({user: req.user.email});
        let [userCharts, teamCharts] = await Promise.all([
            statUtils.generateData(userArticles, "My Articles"),
            statUtils.generateData(team.articles, "Team Articles")
        ]);

        res.json({
            success: true,
            message: 'success',
            result: {
                userInfo: {
                    myNumArticles: userArticles.length,
                    teamNumArticles: team.articles.length
                },
                userSourcesPie: userCharts.pie,
                userArticlesLine: userCharts.line,
                teamSourcesPie: teamCharts.pie,
                teamArticlesLine: teamCharts.line,
                teamInfo: {
                    name: team.schoolName,
                    code: team.teamCode,
                    users: teamUsers
                }
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
