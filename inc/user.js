
var Sync = require('../node_modules/sync')
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log

module.exports = function (user,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI) 
  var users = db.collection.sync(db, "users")

  // user works
  if(user){
    user = new ObjectID(user)
    user = users.findOne.sync(users, {_id:user}, {})
    if(!user) return callback(new Error("bad auth"),result)
    else {
      delete user.password
      delete user._id
      user.website = user.website || null
      return callback(error,user) 
    }  
  } else return callback(new Error("bad auth"),result)

} catch(e) { // главный обработчик ошибок
  log("Internal error in user module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}   
}) 
}

