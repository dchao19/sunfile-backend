var express = require('express');
var passport = require('passport');
var router = express.Router(); // eslint-disable-line

var Team = require('../models/Team');

var StatUtils = require('../utils/statUtils');

router.use(passport.authenticate('bearer', {
    session: false,
    failureRedirect: '/api/auth/loudfailure'
}));

router.get('/user', async (req, res) => {
    try {
        let team = await Team.findOne({users: {$elemMatch: {email: req.user.email}}});
        let userData = {
            user: req.user,
            team
        };
        res.json({
            success: true,
            message: 'success',
            result: userData
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
    let team = await Team.findOne({users: {$elemMatch: {email: req.user.email}}});
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
        let team = await Team.findOne({users: {$elemMatch: {email: req.user.email}}});
        if (!team) {
            return res.json({
                success: false,
                message: 'not-found-error',
                errorCode: 3,
                errMessage: 'The user\'s team could not be found'
            });
        }

        let teamArticles = team.articles;
        let userArticles = team.articles.filter((article) => {
            return article.user === req.user.email;
        });

        let [userCharts, teamCharts] = await Promise.all([
            statUtils.generateData(userArticles, "My Articles"),
            statUtils.generateData(teamArticles, "Team Articles")
        ]);

        res.json({
            success: true,
            message: 'success',
            result: {
                userInfo: {
                    myNumArticles: userArticles.length,
                    teamNumArticles: teamArticles.length
                },
                userSourcesPie: userCharts.pie,
                userArticlesLine: userCharts.line,
                teamSourcesPie: teamCharts.pie,
                teamArticlesLine: teamCharts.line,
                teamInfo: {
                    name: team.schoolName,
                    code: team.id,
                    users: team.users
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
