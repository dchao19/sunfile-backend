var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Article = new Schema({
    title: String,
    user: String,
    schoolID: String,
    longPublication: String,
    shortPublication: String,
});

module.exports = mongoose.model('Article', Article);