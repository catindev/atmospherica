var email   = require("../../../node_modules/emailjs")
var ejs = require("../../../node_modules/express/node_modules/ejs")
var fs = require('fs')
var log = require("util").log

module.exports = function(data){
	var TO = data.username ? (data.username + " <" + data.email + ">") : data.email
	fs.readFile(__dirname + "/" + data.template + '.ejs','utf-8', function(err, tpl) {
    	if(err) { 
    		log("Email error for " + TO + ". Reason - template error")
    		return console.log(err)
    	}	

    	var message = ejs.render(tpl,data.message)	

		var server  = email.server.connect({
		   user:    "support@atmospheri.ca", 
		   password:"Murdzelius999", 
		   host:    "email.atmospheri.ca", 
		   ssl:     false
		})
		var message = {
		   text:    "Sorry, but html emails not supported by your email service!", 
		   from:    "Atmospherica <support@atmospheri.ca>", 
		   to:      TO,
		   subject: data.subject,
		   attachment: 
		   [
		      {data: message, alternative:true},
		      /*{path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}*/
		   ]
		}

		server.send(message, function(err, message) { if(err){ log("Email error for " + TO); console.log(err); } })    
	})
}