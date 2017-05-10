var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TeamUserData = require('./TeamUserData');

var Team = new Schema({
    contactEmail: String,
    schoolName: String,
    teamCode: String,
    users: [TeamUserData.schema],
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }]
});

module.exports = mongoose.model('Team', Team);
