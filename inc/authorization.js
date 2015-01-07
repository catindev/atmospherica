
var log = require("util").log
var Sync = require('sync')
var crypto = require('crypto')
var bcrypt = require('../node_modules/bcrypt')
var dbAPI = require('./dbprovider') // database
var config = require("../config.json") // конфиг

module.exports = function (login,pass,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок
  var db = dbAPI.open.sync(dbAPI)
  var users = db.collection.sync(db, "users")
  if(user = users.findOne.sync(users, {email:login.toLowerCase()}, {})){ 
      // если пароль совпал
      if(pass = crypto.createHash("md5").update(pass + config.password_salt).digest("hex"), bcrypt.compareSync(pass, user.password)) var result = user._id.toString() 
      else error = "Invalid password"
  } else error = "Invalid username or email"
  if(error) error = new Error(error)  
  callback(error,result)
} catch(e){ // главный обработчик ошибок
  log("Internal error in authorization module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)      
}
}) 
}