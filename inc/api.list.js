
var Sync = require('../node_modules/sync')
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log

module.exports = function (key,skip,type,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users")
  var posts = db.collection.sync(db, "posts") 
  var list = null
  var mode = null

  // user works
  if(user){
    user = new ObjectID(user)
    user = users.findOne.sync(users, {_id:user}, {})
    if(!user) return callback(new Error("bad auth"),result)
  } else return callback(new Error("bad auth"),result)

  query = {'user.$id':user._id}  
  if(type === "draft") { query.draft = true; mode = "draft" }
  else if(type === "nodraft") { query.draft = false; mode = "nodraft" }
  else mode = "all"  
  if(skip) query.date = {$lt:skip}
  
  list = posts.find.sync(posts, query, {_id:0,name:1,subtitle:1,id:1,draft:1},{limit:50}).sort({date:-1})
  list = list.toArray.sync(list)

  if(list.length>0) {
    result = {}
    result.list = list  
    result.last = list[list.length-1].date 
    result.mode = mode 
  } else result = {list:null,last:null,mode:mode}

  callback(error,result) 
  
} catch(e) { // главный обработчик ошибок
  log("Internal error in list module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
} 
}) 
}

