var azure = require('azure-storage');
var async = require('async');

module.exports = DeleteTweetList;

function DeleteTweetList(tweet) {
  this.tweet = tweet;
}

DeleteTweetList.prototype = {
  showTweets: function(req, res) {
    self = this;
    var query = new azure.TableQuery()
      .where('PartitionKey eq ?', 'mytweets');
    self.tweet.find(query, function itemsFound(error, items) {
      res.render('delete',{title: 'Tweets to Delete ', tweets: items});
    });
  },

  deleteTweet: function(req,res) {
    var self = this;
    var deletedTweets = Object.keys(req.body);
    async.forEach(deletedTweets, function taskIterator(deletedTweet, callback) {
      self.tweet.deleteTweet(deletedTweet, function itemsUpdated(error) {
        if(error){
          callback(error);
        } else {
          callback(null);
        }
      });
    }, function goHome(error){
      if(error) {
        throw error;
      } else {
       res.redirect('/delete');
      }
    });
  }
}