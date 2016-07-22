var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamUserData = new Schema({
    firstName: String,
    lastName: String,
    numArticles: Number,
    email: String
});

module.exports = mongoose.model('TeamUserData', TeamUserData);
