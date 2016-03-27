var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamp = require('mongoose-timestamp');

var Article = new Schema({
    title: String,
    teamID: String,
    longPublication: String,
    shortPublication: String,
    articleContent: String,
    user: String
});

Article.plugin(timestamp);

module.exports = mongoose.model('Article', Article);