
var Sync = require('../node_modules/sync')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log

module.exports = function (user,post,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users") // коллекция аккаунтов
  var posts = db.collection.sync(db, "posts") // коллекция постов

  // user works
  if(user){
    user = new ObjectID(user)
    user = users.findOne.sync(users, {_id:user}, {})
    if(!user) return callback(new Error("bad auth"),result)
  } else return callback(new Error("bad auth"),result)
  
  // post works
  if(post){
    post = posts.findOne.sync(posts, {id:post}, {})
    if(!post) return callback(new Error("Post not found"),null)
  } else return callback(new Error("Post not found"),null) 
  
  post.user = db.dereference.sync(db,post.user) 
  if(post.user._id.toString() != user._id.toString()) return callback(Error("Access denied!"), null)  
  posts.update.sync(posts, {_id:post._id},{$set:{draft:false}}) 
  /* генерим ответ */
  callback(error,post.id) 

} catch(e) { // главный обработчик ошибок
  log("Internal error in updatepost module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}   
}) 
}