
var log = require("util").log
var express = require('express')
var app = express()

app.get('/:pid',function(request,response){
  response.redirect("http://atmospheri.ca/r/"+request.params.pid)
})

/* 404 */
app.get("*", function(request, response) { response.redirect("http://atmospheri.ca") })
app.post("*", function(request, response) { response.json({status:"error",reason:"invalid resource"}).end })


var server = app.listen(3003,"166.78.111.100")