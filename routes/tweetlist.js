var azure = require('azure-storage');
var async = require('async');

module.exports = TweetList;

function TweetList(tweet, bot) {
  this.tweet = tweet;
  this.bot = bot ;
}

TweetList.prototype = {
  showTweets: function(req, res) {
    self = this;
    var query = new azure.TableQuery()
      .where('PartitionKey eq ?', 'mytweets');
    self.tweet.find(query, function itemsFound(error, items) {
      res.render('index',{title: 'My Tweet List ', tweets: items});
    });
  },

  addTweet: function(req,res) {
    var self = this      
    var item = req.body.item;
    self.tweet.addTweet(item, function itemAdded(error) {
      if(error) {
        throw error;
      }
      res.redirect('/');
    });
  },

  postTweet: function(req,res) {
    var self = this;
    var body = req.body;
    var postedTweets = Object.keys(body); 
    async.forEach(postedTweets, function taskIterator(postedTweet, callback) {
      var status = Object.keys(body).map(function (key) {
        return body[postedTweet];
      });  
      self.bot.tweet(status.toString(), function(error, reply ){
        if(error){
          callback(error);
        } else {
          self.tweet.updateTweet(postedTweet, function itemsUpdated(error) {
            if(error){
              callback(error);
            } else {
              callback(null);
            }
          });
        }
      });
    }, function goHome(error){
      if(error) {
        res.status(error.status || 500);
          res.render('error', {
          message: error.message,
          error: {}
        });
      } else {
        res.redirect('/');
      }
    });
  }
}