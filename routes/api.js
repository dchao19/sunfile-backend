var express = require('express');
var router = express.Router();
var Account = require('../models/Account');
var Team = require('../models/Team');
var passport = require('passport');
var utils = require('../utils/utils.js');
var Article = require('../models/Article');
var cors = require('cors');
var async = require("async");
var RandomColor = require('just.randomcolor');
var moment = require('moment');
var Source = require('../models/Source');

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i].longPublication === what.longPublication) {
            count++;
        }
    }
    return count;
}

Array.prototype.indexOfObject = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === value) return i;
    }
    return -1;
}



router.use(cors({
    origin: ["null", "http://localhost:8081"],
    credentials: true,
    methods: ['GET', 'POST']
}));

router.options('*', cors({
    origin: ["null", "http://localhost:8081"],
    credentials: true,
    methods: ['GET', 'POST']
}));

// UNAUTHENTICATED ROUTES
router.get('/', function(req, res) {
    res.json({message: "API v1 OK!"});
});

router.get('/sources', function(req, res) {
    var sourcesShort = {};
    var sourcesLong = {};
    Source.find({}, function(err, sources) {
        if (err) {
            res.json({message: 'server error', errMessage: err});
        } else {
            async.each(sources, function(source, callback) {
                sourcesLong[source.host] = source.longName;
                sourcesShort[source.host] = source.shortName;
                callback();
            }, function(err) {
                if (err) {
                    res.json({message: 'server error', errMessage: err});
                } else {
                    res.json({
                        message: "success",
                        result: {
                            sources: sourcesShort,
                            sourcesFullName: sourcesLong
                        }
                    });
                }
            });
        }
    });
});

router.get('/auth/register', function(req, res) {
    Account.register(new Account({username: req.query.username, firstName: req.query.firstname, lastName: req.query.lastname}), req.query.password, function(err) {
        if (err) {
            return res.json({message: "Error creating account", errMessage: err});
        } else {
            passport.authenticate('local')(req, res, function() {
                req.session.authenticated = true;
                res.json({message: "Login and Registration Successful!"});
            });
        }
    });
});

router.post('/auth/register', function(req, res) {
    Account.register(new Account({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName}), req.body.password, function(err) {
        if (err) {
            return res.json({message: "Error creating account", errMessage: err});
        } else {
            passport.authenticate('local')(req, res, function() {
                req.session.authenticated = true;
                res.json({message: "Login and Registration Successful!"});
            });
        }
    });
});

router.post('/auth/login', passport.authenticate('local'), function(req, res) {
    req.session.authenticated = true;
    res.json({message: "Login successful!"});
});

router.get('/auth/login', passport.authenticate('local'), function(req, res) {
    console.log(req.session);
    req.session.authenticated = true;
    res.json({message: "Login successful!"});
});

// SESSION AUTHENTICATION
router.use(function(req, res, next) {
    if (!req.session || !req.session.authenticated) {
        res.status(401).json({message: "Unauthorized!", errMessage: "You are not logged in with the correct credientals to preform this action / your cookie could have expired!"});
    } else {
        next();
    }
});

/* ********************
  AUTHENTICATED ROUTES
**********************/

// LOGIN/LOGOUT/AUTH TESTING
router.get('/auth/testAuth', function(req, res) {
    Account.findOne({username: req.session.passport.user}, function(err, account) {
        if (err) {
            res.json({message: "Server error", errMessage: err});
        } else if (account) {
            res.json({
                message: "Auth good!",
                result: {
                    firstName: account.firstName,
                    lastName: account.lastName,
                    teamID: account.teamID,
                    username: account.username
                }
            });
        } else {
            res.json({message: "No account", errMessage: "No user with the given account could be found."});
        }
    });
});

router.get('/auth/expireCookie', function(req, res) {
    req.session.cookie.maxAge = 60000;
    console.log("expiring cookie: " + JSON.stringify(req.session));
    res.json({message: "cookie set to expire"});
});

router.get('/auth/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.json({message: 'Server error', errMessage: err});
        } else {
            res.clearCookie('connect.sid', {path: '/'});
            res.json({message: "logged out"});
        }
    });
});

// TEAMS
router.post('/teams/new', function(req, res) {
    var newTeam = new Team({
        contactEmail: req.body.contactEmail,
        schoolName: req.body.schoolName,
        id: utils.generateRandomTeamCode()
    });
    newTeam.users.push(req.session.passport.user);
    Account.findOne({username: req.session.passport.user}, function(err, account) {
        if (err) {
            res.json({message: "could not check", errMessage: err});
        } else if (account) {
            account.teamId = newTeam.id;
            account.save();
            Team.findOne({schoolName: newTeam.schoolName}, function(err, team) {
                if (!team) {
                    newTeam.save(function(err, team) {
                        if (err) {
                            res.json({message: "Could not create team.", errMessage: "An internal server error has occured"});
                        } else {
                            res.json({message: "success", result: team});
                        }
                    });
                } else if (team) {
                    res.json({message: "Could not create team.", errMessage: "A team with the given name already exists. You should message: " + team.contactEmail});
                } else if (err) {
                    res.json({message: "server error", errMessage: "An internal server error has occured"});
                }
            });
        } else {
            res.json({message: "unknown error", errMessage: "user does not exist"});
        }
    });
});

router.post('/teams/adduser', function(req, res) {
    Team.findOne({id: req.body.teamId}, function(err, team) {
        if (team) {
            Account.findOne({username: req.session.passport.user}, function(err, account) {
                if (account) {
                    account.teamId = req.body.teamId;
                    account.save();

                    team.users.push(req.session.passport.user);
                    team.save();

                    res.json({message: "Successfully joined team", result: team});
                } else if (err) {
                    res.json({message: "could not check", errMessage: "An internal server error has occured"});
                } else {
                    res.json({message: "unknown error", errMessage: "This user does not exist."});
                }
            });
        } else if (err) {
            res.json({message: "Could not join team", errMessage: "An internal server error has occured"});
        } else {
            res.json({message: "Could not join team", errMessage: "A team with the given team code does not exist."});
        }
    });
});

router.post('/sources/new', function(req, res) {
    if (req.session.passport.user === "danielchao") {
        Account.findOne({username: req.session.passport.user}, function(err, account) {
            if (!account) {
                res.json({message: "unknown error", errMessage: "user does not exist"});
            } else if (err) {
                res.json({message: "could not check", errMessage: err});
            } else {
                Source.findOne({host: req.body.host}, function(err, source) {
                    if (err) {
                        res.json({message: "An internal server error has occured."});
                    } else if (source) {
                        res.json({message: "This source already exists with the given host", errMessage: "A source with the given host already exists. You cannot add another one."});
                    } else {
                        var newSource = new Source({
                            shortName: req.body.shortName,
                            longName: req.body.longName,
                            host: req.body.host
                        });
                        newSource.save(function(err, newSource) {
                            if (err) {
                                res.json({message: "An internal server error has occured", errMessage: err});
                            } else {
                                res.json({message: "success", result: newSource});
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json(401, {message: "not correct auth level", errMessage: "You do not have the necessary permissions to complete this action"});
    }
});

router.get('/teams/checkuser', function(req, res) {
    Account.findOne({username: req.session.passport.user}, function(err, account) {
        if (!account) {
            res.json({message: "unknown error", errMessage: "user does not exist"});
        } else if (err) {
            res.json({message: "could not check", errMessage: err});
        } else if (account.teamId) {
            res.json({message: "success", result: account.teamId});
        } else {
            res.json({message: "no associated team", errMessage: "no associated team with the current user"});
        }
    });
});

router.post('/article/new', function(req, res) {
    var newArticle = new Article({
        title: req.body.title,
        teamID: req.body.teamID,
        longPublication: req.body.fullPublication,
        shortPublication: req.body.shortPublication,
        articleContent: req.body.articleContent,
        user: req.session.passport.user
    });

    Article.findOne({articleContent: newArticle.articleContent, longPublication: newArticle.longPublication, teamID: newArticle.teamID}, function(err, article) {
        if (article) {
            res.json({message: "Duplicated article error", errMessage: "Somebody from your team has already filed this article!"});
        } else if (err) {
            res.json({message: "Server error", errMessage: err});
        } else {
            Account.findOne({username: newArticle.user}, function(err, account) {
                if (!account) {
                    res.json({message: "Unknown user", errMessage: "No user with the email could be found."});
                } else if (err) {
                    res.json({message: "Server error", errMessage: err});
                } else {
                    account.articles.push(newArticle);
                    account.save();
                    Team.findOne({id: newArticle.teamID}, function(err, team) {
                        if (!team) {
                            res.json({message: "Unknown team", errMessage: "This team could not be found."});
                        } else if (err) {
                            res.json({message: "Server error", errMessage: err});
                        } else {
                            team.articles.push(newArticle);
                            team.save();

                            newArticle.save(function(err) {
                                if (err) {
                                    res.json({message: "Server error", errMessage: err});
                                    return;
                                } else {
                                    res.json({message: "Article saved", result: "saved"});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/stats/getStats', function(req, res) {
    var response = {
        infoStats: {
            myNumArticles: 0,
            teamNumArticles: 0,
            teamName: "",
            teamCode: ""
        },
        mySourcesPie: [],
        teamSourcesPie: [],
        myArticlesLine: {
            labels: [],
            datasets: []
        },
        teamArticlesLine: {
            labels: [],
            datasets: []
        },
        teamStats: []
    };
    Account.findOne({username: req.session.passport.user}, function(err, account) {
        if (err) {
            res.json({message: "Server error", errMessage: "An internal server error has occured"});
        } else if (!account) {
            res.json({message: "Could not find user", errMessage: "A user with the given email could not be found."});
        } else {
            Team.findOne({id: account.teamId}, function(err, team) {
                if (!team) {
                    res.json({message: "Could not find team", errMessage: "A team with the given team tcode does not exist"});
                } else if (err) {
                    res.json({message: "Server error", errMessage: "An internal server error has occured"});
                } else {
                    response.infoStats.teamNumArticles = team.articles.length;
                    response.infoStats.myNumArticles = account.articles.length;
                    response.infoStats.teamName = team.schoolName;
                    response.infoStats.teamCode = team.id;

                    var sources = [];
                    var distinctSources = [];
                    var myArticlesCountLineChart = [];
                    var teamArticlesCountLineChart = [];

                    async.each(team.articles, function(article, callback){
                        var toPush = {
                            shortPublication: article.shortPublication,
                            longPublication: article.longPublication
                        };
                        sources.push(toPush);

                        if (distinctSources.indexOfObject("longPublication", toPush.longPublication) < 0) {
                            distinctSources.push(toPush);
                        }

                        callback();
                    }, function() {
                        async.forEachOf(distinctSources, function(source, index, callback) {
                            if (team.articles.length !== 0) {
                                distinctSources[index].value = countInArray(sources, source);
                            }
                            callback();
                        }, function() {
                            async.each(distinctSources, function(source, callback) {
                                var colorR = new RandomColor({
                                    a: [0.9, 1.0]
                                });
                                
                                var teamSourcesDataItem = {
                                    value: source.value,
                                    color: colorR.toRGBA().toCSS(),
                                    highlight: "rgba(" + colorR.toRGBA().value.r + "," + colorR.toRGBA().value.g + "," + colorR.toRGBA().value.b + ",0.6)",
                                    label: source.shortPublication,
                                    long: source.longPublication
                                };
                                
                                response.teamSourcesPie.push(teamSourcesDataItem);
                                
                                callback();
                            }, function() {
                                var todayDate = moment().get('date');
                                async.waterfall([
                                    function (callback) {
                                        var labels = [];
                                        for (var i = 1; i <= todayDate + 1; i++) {
                                            if (i == 1 || i % 5 == 0) labels.push(moment().format("MMMM") + " " + i);
                                            else labels.push("");
                                            if (i == todayDate) {
                                                response.myArticlesLine.labels = labels;
                                                response.teamArticlesLine.labels = labels;
                                                callback(null, labels);
                                            }
                                        }
                                    }, function (arg1, callback2) {
                                        var index = 1;
                                        async.whilst(
                                            function () { return index <= (todayDate + 1) },
                                            function (callback) {
                                                var startRange = moment().date(index).startOf('day');
                                                var endRange = moment(startRange).add(1, 'days');
                                                Article.find({
                                                    createdAt: {
                                                        $gte: startRange.toDate(),
                                                        $lt: endRange.toDate()
                                                    },
                                                    user: req.session.passport.user
                                                }, function (err, myArticles) {
                                                    if (err) res.json({message: "Server error", errMessage: "An internal server error has occured." });
                                                    else {
                                                        myArticlesCountLineChart.push(myArticles.length);
                                                        Article.find({
                                                            createdAt: {
                                                                $gte: startRange.toDate(),
                                                                $lt: endRange.toDate()
                                                            },
                                                            teamID: account.teamId,
                                                        }, function (err, teamArticles) {
                                                            if (err) res.json({message: "Server error", errMessage: "An internal server error has occured." });
                                                            else {
                                                                teamArticlesCountLineChart.push(teamArticles.length);
                                                                index++;
                                                                callback(null);
                                                            }
                                                        });
                                                    }
                                                });
                                            }, function (err) {
                                                callback2(null);
                                            }
                                        )
                                    }
                                ], function (err) {
                                    response.myArticlesLine.datasets.push({
                                        label: "My Articles",
                                        fillColor: "rgba(219,75,75,0.3)",
                                        strokeColor: "rgba(219,75,75,1)",
                                        pointColor: "rgba(219,75,75,1)",
                                        pointStrokeColor: "#fff",
                                        pointHighlightFill: "#fff",
                                        pointHighlightStroke: "rgba(219,75,75,1)",
                                        data: myArticlesCountLineChart
                                    })
                                    response.teamArticlesLine.datasets.push({
                                        label: "Team Articles",
                                        fillColor: "rgba(219,75,75,0.3)",
                                        strokeColor: "rgba(219,75,75,1)",
                                        pointColor: "rgba(219,75,75,1)",
                                        pointStrokeColor: "#fff",
                                        pointHighlightFill: "#fff",
                                        pointHighlightStroke: "rgba(219,75,75,1)",
                                        data: teamArticlesCountLineChart
                                    })
                                    
                                    var mySources = [];
                                    var myDistinctSources = [];
                                    async.each(account.articles, function (myArticle, callback) {
                                        var toPush = {
                                            shortPublication: myArticle.shortPublication,
                                            longPublication: myArticle.longPublication
                                        }
                                        mySources.push(toPush);
                                        if (myDistinctSources.indexOfObject("longPublication", toPush.longPublication) < 0) myDistinctSources.push(toPush);
                                        callback();
                                    }, function () {
                                        async.forEachOf(myDistinctSources, function (source, index, callback2) {
                                            if(account.articles.length != 0) myDistinctSources[index].value = countInArray(mySources, source);
                                            callback2();
                                        }, function (err) {
                                            async.each(myDistinctSources, function (source, callback) {
                                                var colorR = new RandomColor({
                                                    a: [0.9, 1.0]
                                                });
                                                var teamSourcesDataItem = {
                                                    value: source.value,
                                                    color: colorR.toRGBA().toCSS(),
                                                    highlight: "rgba(" + colorR.toRGBA().value.r + "," + colorR.toRGBA().value.g + "," + colorR.toRGBA().value.b + ",0.6)",
                                                    label: source.shortPublication,
                                                    long: source.longPublication
                                                }
                                                response.mySourcesPie.push(teamSourcesDataItem);
                                                callback();
                                            }, function () {
                                                var users = [];
                                                async.each(team.users, function (email, callback) {
                                                    Account.findOne({ "username": email }, function (err, account) {
                                                        if (!account) res.json({message: "Could not find user", errMessage: "This user could not be found." });
                                                        else if (err) res.json({message: "Server error", errMessage: "An internal server error has occured" });
                                                        else {
                                                            var user = {
                                                                "name": "",
                                                                "numArticles": 0
                                                            }
                                                            user.name = account.firstName + " " + account.lastName,
                                                        user.numArticles = account.articles.length || 0;
                                                            users.push(user);
                                                            callback();
                                                        }
                                                    });
                                                }, function (err) {
                                                    response.teamStats = users;
                                                    res.json({message: "success", result: response });
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });            
                };
            });
        }
    });
});

router.get('/stats/userinfo', function(req, res) {
    Account.findOne({username: req.session.passport.user}, function(err, account) {
        if (err) {
            res.json({message: "Server error", errMessage: "An internal server error has occured."});
        } else if (account) {
            res.json({message: "success", result: account});
        } else {
            res.json({message: "Could not find user", errMessage: "A user with the authenticated email could not be found."});
        }
    });
});

module.exports = router;
