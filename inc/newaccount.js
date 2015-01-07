
var Sync = require('sync')
var crypto = require('crypto')
var bcrypt = require('../node_modules/bcrypt')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var log = require("util").log
var sendmail = require("./common/mail/sendmail")
var validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function (data,callback) { 
Sync(function(){
var error = result = null;
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI) 
  var users = db.collection.sync(db, "users") // коллекция аккаунтов

  // проверка на обязательные ключи
  var query           = {}
  query.name          = data.name || null
  query.password      = data.password || null
  query.email         = data.email.toLowerCase() || null

  if(!query.name || typeof query.name != "string" || !query.password || typeof query.password != "string" || !query.email || typeof query.email != "string") error = "Invalid params"

  // проверка на минимальную длину имени
  query.name && 2 > query.name.length && (error = "Name too short (less than 2 chars)"); 
  // проверка на максимальную длину имени  
  query.name && 30 < query.name.length && (error = "Name too big (more than 30 chars)"); 

  // валидация почты  
  query.email && (validEmail.test(query.email) || (error = "Invalid email"));
  // проверка на повторение почты
  query.email && query.name && users.findOne.sync(users, {email:query.email}, {}) && (error = "Email already registered");
  
  if(error) return callback(new Error(error),result) // возвращаем ошибку если есть

  // шифрование пароля 
  query.password = crypto.createHash('md5').update(query.password + config.password_salt).digest("hex")
  query.password = bcrypt.hashSync(query.password, 8)
  var new_account   = users.insert.sync(users, query) // создаем аккаунт
  /* генерим ответ */
  var result = new_account[0]._id.toString()
  /* приветственное письмо */
  sendmail({
    email:new_account[0].email,
    username:new_account[0].name,
    template:"welcome",
    subject:"Welcome!",
    message:{ user:new_account[0].name }
  })

  callback(error,result) 

} catch(e) { // главный обработчик ошибок
  return log("Internal error in newaccount module!"), console.log(e.stack), callback(new Error("Internal server error"),result)  
}   
}) 
}