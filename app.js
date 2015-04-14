var azure = require('azure-storage');
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json'});
var tableName = nconf.get("TABLE_NAME");
var tweetPartitionKey = nconf.get("TWEET_PARTITION_KEY");
var favoritePartitionKey = nconf.get("FAVORITE_PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var consumerKey = nconf.get("CONSUMER_KEY");
var consumerSecret = nconf.get("CONSUMER_SECRET");
var accessToken = nconf.get("ACCESS_TOKEN");
var accessTokenSecret = nconf.get("ACCESS_TOKEN_SECRET");

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var Bot = require('./lib/bot');
var bot = new Bot({
    consumer_key:         consumerKey
  , consumer_secret:      consumerSecret
  , access_token:         accessToken
  , access_token_secret:  accessTokenSecret
});

var TweetList = require('./routes/tweetlist');
var DeleteTweetList = require('./routes/deletetweetlist');
var FavoriteSearch = require('./routes/favoritesearch');

var Tweet = require('./models/tweet');
var Favorite = require('./models/tweet');

var tweet = new Tweet(azure.createTableService(accountName, accountKey), tableName, tweetPartitionKey);
var favorite = new Tweet(azure.createTableService(accountName, accountKey), tableName, favoritePartitionKey);

var tweetList = new TweetList(tweet, bot);
var deletetweetList = new DeleteTweetList(tweet);
var favoriteSearch = new FavoriteSearch(favorite, bot);

// views
app.get('/', tweetList.showTweets.bind(tweetList));
app.get('/delete', deletetweetList.showTweets.bind(deletetweetList));
app.get('/favorite', function(req,res) {
    res.render('favorite',{title: 'Find Some Favs'});
});


// actions
app.post('/deletetweet', deletetweetList.deleteTweet.bind(deletetweetList));
app.post('/addtweet', tweetList.addTweet.bind(tweetList));
app.post('/posttweet', tweetList.postTweet.bind(tweetList));
app.post('/searchTweets', favoriteSearch.searchTweets.bind(favoriteSearch));
app.post('/addFavorites', favoriteSearch.addFavorites.bind(favoriteSearch));


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
