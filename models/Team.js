var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Team = new Schema({
    "contactEmail": String,
    "schoolName": String,
    "id": String,
    "users": [String]
});

module.exports = mongoose.model('Team', Team);