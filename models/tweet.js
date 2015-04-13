var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;

module.exports = Tweet;

function Tweet(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  this.partitionKey = partitionKey;
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

Tweet.prototype = {
  find: function(query, callback) {
    self = this;
    self.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        callback(null, result.entries);
      }
    });
  },

  addTweet: function(item, callback) {
    self = this;
    var itemDescriptor = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(uuid()),
      tweet: entityGen.String(item.tweet),
      count: entityGen.Int32(0)
    };
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  },

  deleteTweet: function(rKey, callback) {
    self = this;
    self.storageClient.retrieveEntity(self.tableName, self.partitionKey, rKey, function entityQueried(error, entity) {
      if(error) {
        callback(error);
      }
      self.storageClient.deleteEntity(self.tableName, entity, function entityDeleted(error) {
        if(error) {
          callback(error);
        }
        callback(null);
      });
    });
  },

  updateTweet: function(rKey, callback) {
    self = this;
    self.storageClient.retrieveEntity(self.tableName, self.partitionKey, rKey, function entityQueried(error, entity) {
      if(error) {
        callback(error);
      }
      entity.count._ =+ 1;
      self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(error) {
        if(error) {
          callback(error);
        }
        callback(null);
      });
    });
  }
}