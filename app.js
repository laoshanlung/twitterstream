var express = require('express')
  , http = require('http')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , session = require('cookie-session')
  , swig = require('swig')
  , errorHandler = require('errorhandler')
  , compress = require('compression')
  , mongoose = require('./models/mongoose')
  , Tweet = require('./models/tweet')
  , _ = require('underscore')
  , moment = require('moment')

var app = express();

app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.enable('trust proxy');

// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(compress({
  memLevel: 3,
  level: 3
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser());

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: 'foo',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(methodOverride());

var env = process.env.NODE_ENV || 'development';

switch (env) {
  case 'production':
    app.set('view cache', true);

    app.use(function(err, req, res, next){
      res.status(404).render('error');
    });
    break;
  case 'test':
    // app.use(logger('dev'));
    
    app.use(errorHandler({
      dumpExceptions : true,
      showStack : true
    }));

    app.set('view cache', false);
    break;
  default:
    app.use(logger('dev'));

    app.use(errorHandler({
      dumpExceptions : true,
      showStack : true
    }));

    app.set('view cache', false);
    break;
}

app.use(express.static('public'));

// Normal routes
app.get('/', function(req, res){
  res.locals.jsModule = 'home';
  res.render('home.html');
});

app.get('/starred', function(req, res){
  res.locals.jsModule = 'starred';
  res.render('starred.html');
});

var processDateQuery = function(req, res, next) {
  var lt = req.query.lt
    , gt = req.query.gt

  req.dateQuery = {};

  if (lt) {
    req.dateQuery.lt = moment(lt).toDate();
  }

  if (gt) {
    req.dateQuery.gt = moment(gt).toDate();
  }

  next();
}

// APIs
app.get('/api/tweets', processDateQuery, function(req, res, next){
  var sessionId = req.sessionID;

  Tweet.list(req.dateQuery).then(function(tweets){
    return _.map(tweets, function(tweet){
      return tweet.apiData(sessionId);
    });
  }).then(function(tweets){
    res.json({
      data: tweets
    });
  }, function(error){
    res.status(400).json({error: error});
  });
});

var getTweet = function(req, res, next) {
  Tweet.findById(req.params.id).then(function(tweet){
    if (!tweet) {
      res.json(400, {error: 'Invalid tweet'});
    } else {
      req.tweet = tweet;
      next();
    }
  });
}

app.post('/api/tweets/:id/star', getTweet, function(req, res, next){
  var sessionId = req.sessionID;
  req.tweet.starredBySession(sessionId).then(function(star){
    res.json({data: star});
  }, function(error){
    res.status(400).json({error: error});
  });
});

app.post('/api/tweets/:id/unstar', getTweet, function(req, res, next){
  var sessionId = req.sessionID;
  req.tweet.unstarredBySession(sessionId).then(function(star){
    res.json({data: star});
  }, function(error){
    res.status(400).json({error: error});
  });
});

app.get('/api/tweets/starred', processDateQuery, function(req, res, next){
  var sessionId = req.sessionID;
  Tweet.listStarredBySession(sessionId, req.dateQuery).then(function(tweets){
    res.json({
      data: tweets
    });
  }, function(error){
    res.status(400).json({error: error});
  });
});

// Get params
var argv = require('optimist').argv;

// port
var port = argv.port || 4000;

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function (callback) {
  var server = app.listen(port, function() {
    console.log('Express server listening on port ', server.address().port);
  });
});