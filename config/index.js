var env = process.env.NODE_ENV || 'development'
  , config = require('./' + env + '.json');

module.exports = config;