﻿var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    userID: String,
    teamCode: String,
    email: String,
    firstName: String,
    lastName: String,
    name: String,
});

module.exports = mongoose.model('Account', Account);
