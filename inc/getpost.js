
var Sync = require('../node_modules/sync')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log
var markdown = require( "./common/render" )
var df = require("./common/datef")
var datef = new df()

module.exports = function (user,post,mode,callback) { 
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
  } else user = null  

  // post works
  if(post){
    post = posts.findOne.sync(posts, {id:post}, {})
    if(!post) return callback(new Error("Not found"),null)
  } else return callback(new Error("Not found"),null)

  // date formatting
  post.date = datef.format(post.date,"%n %d, %y")
  post.last_update = datef.format(post.last_update,"%n %d, %y at %H:%M")
  post.user = db.dereference.sync(db,post.user) 

  if(mode === "read"){ // read mode
    // если не авторизован и черновик
    if(post.draft && !user) return callback(new Error("Post in draft mode"),null)
    // если черновик и не является владельцем
    if(post.draft && post.user._id.toString() != user._id.toString()) return callback(new Error("Post in draft mode"),null)
    if(post.content) post.content = markdown( post.content )
    if(user){
      if(post.user._id.toString() === user._id.toString()) post.owner = true
      else post.owner = false  
    } else post.owner = false 
  } else if(mode === "edit"){ // edit mode
    if(!user || (post.user._id.toString() != user._id.toString())) return callback(new Error("Access denied"),null)
    posts.update.sync(posts, {_id:post._id},{$set:{draft:true}}) // переносим в черновики  
  } else return callback(new Error("Invalid mode"),null)
  return callback(null,post) 
  
} catch(e) { // главный обработчик ошибок
  log("Internal error in getpost module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),null)  
}   
}) 
}