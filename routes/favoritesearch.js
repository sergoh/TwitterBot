var azure = require('azure-storage');
var async = require('async');

module.exports = FavoriteSearch;

function FavoriteSearch(favorite, bot) {
  this.favorite = favorite;
  this.bot = bot ;
}

FavoriteSearch.prototype = {
  searchTweets: function(req, res) {
    self = this;
    var searchKeyword = req.body.tweet.keyword;
    var params = {
      q: searchKeyword,
      result_type: 'mixed',
    };
    var query = self.bot.search(params, function(error,items){
      res.render('favorite',{title: 'Find Some Favs', tweets: items.statuses});
    });
  },

  addFavorites: function(req,res) {
    var self = this;
    var body = req.body;
    var favorites = Object.keys(body); 
    async.forEach(favorites, function taskIterator(favorite, callback) {
      var status = Object.keys(body).map(function (key) {
        return body[favorite];
      });  
      var params = {
        q: searchKeyword,
        result_type: 'mixed',
      };
      self.bot.favorite(, function(error, reply ){
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