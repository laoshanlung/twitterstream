var mongoose = require('./mongoose');

var Schema = mongoose.Schema({
  _id: String
});

module.exports = mongoose.model('Session', Schema);