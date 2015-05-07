var mongoose = require('mongoose')
  , config = require('../config')

var connectionString = 'mongodb://' + config.mongo.username + ':' + config.mongo.password + '@' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database;

mongoose.connect(connectionString);

module.exports = mongoose;