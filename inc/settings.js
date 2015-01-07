
var Sync = require('../node_modules/sync')
var crypto = require('crypto')
var bcrypt = require('../node_modules/bcrypt')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var ObjectID = require('../node_modules/mongodb').ObjectID
var log = require("util").log

var validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function (user,data,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users") 
  var query = {}

  // user works
  if(user){
    user = new ObjectID(user)
    user = users.findOne.sync(users, {_id:user}, {})
    if(!user) return callback(new Error("bad auth"),result)
  } else return callback(new Error("bad auth"),result)

  // проверка на ключи
  query.password = data.password || null
  query.email = data.email.toLowerCase() || null
  query.name = data.name || null
  query.website = data.website || null
  // удаляем пустые ключи
  for(var i in query){ if(!query[i]) delete query[i] }

  /* валидация и необходимые преобразования*/
  if(query.name && (query.name != user.name)){ // валидируем юзернейм
      query.name && 2 > query.name.length && (error = "Name too short (less than 2 chars)"); 
      query.name && 30 < query.name.length && (error = "Name too big (more than 30 chars)");    
  } else delete query.name
  if(query.email && (query.email != user.email)){ // валидация почты 
      query.email && (validEmail.test(query.email) || (error = "Invalid email"));
      query.email && users.findOne.sync(users, {email:query.email}, {}) && (error = "Email alredy registered");      
  } else delete query.email
  if(error) return callback(new Error(error),result) // возвращаем ошибку если есть
  if(query.password){ // шифрование пароля
      query.password = crypto.createHash('md5').update(query.password + config.password_salt).digest("hex")
      query.password = bcrypt.hashSync(query.password, 8)      
  }    

  users.update.sync(users,{_id:user._id},{$set:query})
  callback(error,result) 

} catch(e) { // главный обработчик ошибок
  log("Internal error in settings module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}   
}) 
}

