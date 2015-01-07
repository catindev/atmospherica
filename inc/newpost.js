
var Sync = require('../node_modules/sync')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log
var shash = require("./common/shash")

module.exports = function (usr,folder,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users") // коллекция аккаунтов
  var posts = db.collection.sync(db, "posts") // коллекция постов
  var query = {} // запрос на запись

  // user works
  if(usr){
    usr = new ObjectID(usr)
    query.user = users.findOne.sync(users, {_id:usr}, {})
    if(query.user) query.user = {$ref:"users",$id:query.user._id}
    else return callback(new Error("bad auth"),result)
  } else return callback(new Error("bad auth"),result)  
  
  // folder works
  if(folder){
    query.folder = new ObjectID(folder)
    query.folder = folders.findOne.sync(folders, {_id:query.folder}, {})
    if(query.folder) query.folder = {$ref:"folders",$id:query.folder._id} 
    else query.folder = null    
  } else query.folder = null 

  // other works
  query.id = shash(new Date())
  query.date = new Date()
  query.last_update = new Date()    
  query.name = "Untitled"
  query.draft = true
  query.title = null
  query.subtitle = null
  query.content = null
  
  var post = posts.insert.sync(posts, query) // сохраняем пост
  /* генерим ответ */
  result = post[0].id
  callback(error,result) 

} catch(e) { // главный обработчик ошибок
  log("Internal error in newpost module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}   
}) 
}