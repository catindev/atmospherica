
var Sync = require('sync')
var crypto = require('crypto')
var bcrypt = require('../node_modules/bcrypt')
var config = require("../config.json") // конфиг
var dbAPI = require('./dbprovider') // database
var log = require("util").log
var sendmail = require("./common/mail/sendmail")
var shuffle = require("./common/shuffle")

module.exports = function (mail,callback) { 
Sync(function(){
var error = result = null
try{ // главный ловец ошибок

  var db = dbAPI.open.sync(dbAPI) 
  var users = db.collection.sync(db, "users")
  var user = users.findOne.sync(users, {email:mail}, {})
  if(user){ 
    
    var small = crypto.createHash('md5').update(new Date().getTime()+user.password).digest("hex")
    var big = crypto.createHash('md5').update(config.password_salt+new Date().getTime()+user.password).digest("hex")
    var new_password = shuffle(big.toUpperCase().replace(/[^A-Za-z]/g,"") + small.toLowerCase().replace(/[^A-Za-z]/g,""))
    new_password = new_password.substr(0,6)
    console.log("npswd: "+new_password)
    var hash = crypto.createHash('md5').update(new_password + config.password_salt).digest("hex")
    hash = bcrypt.hashSync(hash, 8)

    users.update.sync(users,{_id:user._id},{$set:{password:hash}}) 
    result = "success"   

    sendmail({
      email:user.email,
      username:user.name,
      template:"password",
      subject:"Password recovery",
      message:{ user:user.name, newpassword:new_password }
    })

  } else error = new Error("Email not registered") 
  callback(error,result) 

} catch(e) { // главный обработчик ошибок
  log("Internal error in repair module!")
  console.log(e.stack)
  return callback(new Error("Internal server error"),result)  
}    
}) 
}

