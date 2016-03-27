var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Article = require('./Article.js');

var Team = new Schema({
    "contactEmail": String,
    "schoolName": String,
    "id": String,
    "users": [String],
    "articles": [Article.schema]
});

module.exports = mongoose.model('Team', Team);