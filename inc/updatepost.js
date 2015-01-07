
var Sync = require('../node_modules/sync')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log

module.exports = function (user,post,ptitle,psubtitle,pcontent,nodraft,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users") // коллекция аккаунтов
  var posts = db.collection.sync(db, "posts") // коллекция постов
  var query = {} // запрос на обновление

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

  // other works
  post.user = db.dereference.sync(db,post.user) 
  if(!post.user){
    log("undefined user for post "+post.id)
    return callback(new Error("Internal server error"),null)
  }
  if(post.user._id.toString() != user._id.toString()) return callback(Error("Access denied!"), null)
  if(typeof ptitle === "string"){
    if(ptitle.length>0) query.name = ptitle
    else query.name = "Untitled" 
    query.title = ptitle
  }
  if(typeof psubtitle === "string") query.subtitle = psubtitle
  if(typeof pcontent === "string") query.content = pcontent
  if(nodraft) {
    if(!query.title) return callback(new Error("Please enter the title"),null)
    if(!query.content) return callback(new Error("Please enter the article text"),null)
    query.draft = false
  }    

  query.last_update = new Date()    
  
  posts.update.sync(posts, {_id:post._id},{$set:query}) // обновляем пост
  /* генерим ответ */
  callback(error,post.id) 

} catch(e) { // главный обработчик ошибок
  log("Internal error in updatepost module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}   
}) 
}