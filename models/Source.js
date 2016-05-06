var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Source = new Schema({
	shortName: String,
	longName: String,
	host: String, 
});

module.exports = mongoose.model('Source', Source);