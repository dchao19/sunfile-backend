var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Team = new Schema({
    contactEmail: String,
    schoolName: String,
    teamCode: String,
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }],
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }]
});

module.exports = mongoose.model('Team', Team);
