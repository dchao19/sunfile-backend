var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamp = require('mongoose-timestamp');

let Article = new Schema({
    title: String,
    longPublication: String,
    shortPublication: String,
    teamCode: String,
    user: String
});

Article.plugin(timestamp);

module.exports = mongoose.model('Article', Article);
