var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    userID: String,
    teamCode: String,
    email: String,
    name: String,
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }]
});

module.exports = mongoose.model('Account', Account);
