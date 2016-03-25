﻿var express = require('express');
var router = express.Router();
var Account = require('../models/Account');
var Team = require('../models/Team');
var passport = require('passport');
var utils = require('../utils/utils.js');

//UNAUTHENTICATED ROUTES
router.get('/', function (req, res) {
    res.json({ "message": "API v1 OK!" });
});

router.get('/auth/register', function (req, res) {
    Account.register(new Account({ username: req.query.username, firstName: req.query.firstname, lastName: req.query.lastName }), req.query.password, function (err, account) {
        if (err) return res.json({ "message": "Error creating account", "errMessage": err })
        passport.authenticate('local')(req, res, function () {
            req.session.authenticated = true; 
            res.json({ "message": "Login and Registration Successful!" }); 
        })
    });
});

router.post('/auth/register', function (req, res) {
    Account.register(new Account({ username: req.body.username, firstName: req.body.firstname, lastname: req.body.lastName }), req.body.password, function (err, account) {
        if (err) return res.json({ "message": "Error creating account", "errMessage": err })
        passport.authenticate('local')(req, res, function () {
            req.session.authenticated = true;
            res.json({ "message": "Login and Registration Successful!" });
        })
    });
});

router.post('/auth/login', passport.authenticate('local'), function (req, res) {
    req.session.authenticated = true;
    res.json({ "message": "Login successful!" });
});

router.get('/auth/login', passport.authenticate('local'), function (req, res) {
    console.log(req.session);
    req.session.authenticated = true;
    res.json({ "message": "Login successful!" });
});

//SESSION AUTHENTICATION
router.use(function (req, res, next) {
    if (!req.session || !req.session.authenticated) res.status(401).json({ "message": "Unauthorized!", "errMessage" : "You are not logged in with the correct credientals to preform this action / your cookie could have expired!" })
    else next();
});


/*********************
  AUTHENTICATED ROUTES
**********************/


//LOGIN/LOGOUT/AUTH TESTING
router.get('/auth/testAuth', function (req, res) {
    console.log("testing auth: " + JSON.stringify(req.session));
    res.json({ "message": "Auth good!" });
});

router.get('/auth/expireCookie', function (req, res) {
    req.session.cookie.maxAge = 60000;
    console.log("expiring cookie: " + JSON.stringify(req.session));
    res.json({ "message": "cookie set to expire" });
});

router.get('/auth/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.clearCookie('connect.sid', { path: '/' });
        res.json({ "message" : "logged out" });
    });
});

//TEAMS
router.post('/teams/new', function (req, res) {
    var newTeam = new Team({
        "contactEmail": req.body.contactEmail,
        "schoolName": req.body.schoolName,
        "id": utils.generateRandomTeamCode()
    });    
    newTeam.users.push(req.session.passport.user);
    Account.findOne({ "username": req.session.passport.user }, function (err, account) {
        if (!account) res.json({ "message": "unknown error", "errMessage": "user does not exist" })
        else if (err) res.json({ "message": "could not check", "errMessage": err });
        account.teamId = newTeam.id;
        account.save();
        newTeam.save(function (err, team) {
            if (err) res.status(500).json({ "message": "Could not create team.", "errMessage": err })
            res.json({ "message": "success", "result": team });
        });
    });
});

router.post('/teams/adduser', function (req, res) {
    Team.findOne({ "id": req.body.teamId }, function (err, team) {
        if (!team) res.json({ "message": "Could not join team", "errMessage": "Team does not exist" });
        else if (err) res.json({ "message": "Could not join team", "errMessage": err });
        Account.findOne({ "username": req.session.passport.user }, function (err, account) {
            if (!account) res.json({ "message": "unknown error", "errMessage": "user does not exist" })
            else if (err) res.json({ "message": "could not check", "errMessage": err });
            account.teamId = req.body.teamId;
            account.save();
            team.users.push(req.session.passport.user);
            team.save();
            res.json({ "message": "Successfully joined team", "result": team });
        });
    });
});

router.get('/teams/checkuser', function (req, res) {
    Account.findOne({ "username": req.session.passport.user }, function (err, account) {
        res.type('json');
        if (!account) res.json({ "message": "unknown error", "errMessage": "user does not exist" })
        else if (err) res.json({ "message": "could not check", "errMessage": err });
        else if (!account.teamId) res.json({ "message": "no associated team", "errMessage": "no associated team with the current user" });
        else res.json({ "message": "success", "result": account.teamId });
    });
});

module.exports = router;