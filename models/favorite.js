var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;

module.exports = Favorite;

function Favorite(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  this.partitionKey = partitionKey;
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

Favorite.prototype = {
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

  addFavorite: function(item, callback) {
    self = this;
    var itemDescriptor = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(uuid()),
      name: entityGen.String(item.name),
      handle: entityGen.String(item.handle),
      tweet: entityGen.String(item.tweet),
      tweedID: entityGen.String(item.tweedID)
    };
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  },

  deleteFavorite: function(rKey, callback) {
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
  }
}