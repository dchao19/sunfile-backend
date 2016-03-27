var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var Article = require('./Article.js');

var Account = new Schema({
    username: String,
    password: String,
    teamId: String,
    firstName: String,
    lastName: String,
    articles: [Article.schema]
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);