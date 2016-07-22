var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Article = require('./Article.js');
var TeamUserData = require('./TeamUserData');

var Team = new Schema({
    contactEmail: String,
    schoolName: String,
    id: String,
    users: [TeamUserData.schema],
    articles: [Article.schema]
});

module.exports = mongoose.model('Team', Team);
