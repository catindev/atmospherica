var log = require("util").log
var config = require("../config.json")
var mongodb = require('../node_modules/mongodb')
var connectionInstance;

module.exports.open = function (callback) {
  if (connectionInstance) return callback(null, connectionInstance)
  var server = new mongodb.Server(config.db.host, config.db.port, {});
  var db = new mongodb.Db(config.db.name, server, config.db.options).open(function (error, client) {
  	if (error) return callback(error, null)
    connectionInstance = client
    callback(null, client)
  })
}