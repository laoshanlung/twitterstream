var mongoose = require('./models/mongoose')
  , Session = require('./models/session')
  , Tweet = require('./models/tweet')
  , Star = require('./models/star')
  , when = require('when')
  , should = require('should')
  , moment = require('moment')

describe('Unit Test', function(){

  before(function(done){
    mongoose.connection.on('error', function(){
      done('Error');
    });

    mongoose.connection.once('open', function () {
      done();
    });
  });

  beforeEach(function(done){
    var self = this;

    when.all([
      Session.remove(),
      Tweet.remove(),
      Star.remove()
    ]).then(function(){
      var session = new Session({
        _id: 'test'
      });

      var tweet = new Tweet({
        _id: 123,
        text: 'Sample tweet',
        user: {
          name: 'test',
          profile_image_url: 'test'
        }
      });

      return when.all([
        tweet.save(),
        session.save()
      ]).then(function(results){
        self.tweet = results[0];
        self.session = results[1];
      });

    }).then(done, done);

  });

  describe('Tweet', function(){

    describe('.list', function(){

      it('returns list of current tweets', function(done){
        Tweet.list().then(function(tweets){
          tweets.length.should.be.equal(1);
        }).done(done, done)
      });

      it('returns list of current tweets later than date', function(done){
        var date = moment().subtract(1, 'd').toDate();

        Tweet.list({lte: date}).then(function(tweets){
          tweets.length.should.be.equal(0);
        }).done(done, done)
      });

    });

    describe('#starredBySession', function(){

      it('stars a tweet for a session', function(done){
        var self = this;

        this.tweet.starredBySession(this.session._id).then(function(){
          
          return when.all([
            Tweet.findById(self.tweet._id),
            Star.count({
              session_id: self.session._id
            })
          ]).then(function(results){
            results[0].starred_by.length.should.be.equal(1);
            results[1].should.be.equal(1);
          });

        }).done(done, done);

      });

      it('ignores duplicated star', function(done){
        var self = this;

        this.tweet.starredBySession(this.session._id).then(function(){
          return self.tweet.starredBySession(self.session._id).then(function(){
            
            return when.all([
              Tweet.findById(self.tweet._id),
              Star.count({
                session_id: self.session._id
              })
            ]).then(function(results){
              results[0].starred_by.length.should.be.equal(1);
              results[1].should.be.equal(1);
            });

          });
        }).done(done, done);

      });

      it('handles invalid session id', function(done){
        var self = this
          , invalid = 'invalid'

        this.tweet.starredBySession(invalid).then(function(){
          return 'Should have exception here';
        }).catch(function(error){

        }).done(done, done);

      });

    });

    describe('#unstarredBySession', function(){

      beforeEach(function(done){
        this.tweet.starredBySession(this.session._id).then(function(){

        }).done(done, done);
      });

      it('unstars a tweet of a session', function(done){
        var self = this;

        this.tweet.unstarredBySession(this.session._id).then(function(){
          return when.all([
            Tweet.findById(self.tweet._id),
            Star.count({
              session_id: self.session._id
            })
          ]).then(function(results){
            results[0].starred_by.length.should.be.equal(0);
            results[1].should.be.equal(0);
          });
        }).done(done, done);

      });

    });

  });

  describe('Star', function(){

    describe('.listBySession', function(){

      beforeEach(function(done){
        this.tweet.starredBySession(this.session._id).then(function(){

        }).done(done, done);
      });

      it('lists all tweets starred by a session', function(done){

        Star.listBySession(this.session._id).then(function(stars){
          stars.length.should.be.equal(1);
        }).done(done, done);

      });

      it('lists all tweets starred by a session later than a specific date', function(done){
        var date = moment().subtract(1, 'd').toDate();

        Star.listBySession(this.session._id, {lte: date}).then(function(stars){
          stars.length.should.be.equal(0);
        }).done(done, done);

      });

    });

  });

});