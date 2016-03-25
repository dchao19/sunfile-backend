#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var indexRoutes = require('./routes/index.js');
var apiRoutes = require('./routes/api.js');
var mongoose = require('mongoose');
var dbConfig = require('./config/dbConfig.js');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var Account = require('./models/Account.js');
var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

mongoose.connect(dbConfig.url, function (err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});


passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    secret: 'ohhhhhhhhh keyboard cat lololololol meep 123jkl;',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    rolling: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        maxAge: 14 * 24 * 60 * 60 * 1000 
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRoutes);
app.use('/api', apiRoutes);

app.listen(port, ipaddress, function () {
    console.log("Express server listening on " + ipaddress + ":" + port);
});

