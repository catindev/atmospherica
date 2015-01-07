
var toobusy = require('toobusy')
var log = require("util").log
var fs = require("fs")
var config = require("./config.json") // конфигурация
var express = require('express')
var staticAsset = require('static-asset')
var sessions = require("client-sessions")
var app = express()

// middlewares
var device = require("./inc/common/device")
var isError = require("./inc/common/iserror")

var const_ = 7 * 24 * 60 * 60 * 1000
var tplDir = __dirname + "/templates/"

app.configure(function () {
  app.set('views', tplDir);
  app.set('view engine', 'ejs')    
  app.use(express.compress())
  app.use(express.favicon("static/img/favicon.png"))
  app.use(staticAsset(__dirname + '/static')) 
  app.use(express.static( __dirname + '/static', { maxAge: const_ } ))
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname+'/temp/' }))
  app.use(sessions({
    cookieName: config.session.key,
    secret: config.session.secret,
    duration: const_,
  })) 
  app.use(function(request, response, next) {
    if (toobusy()) {
      if(request.method === "GET") return response.send("Too many writers! Try later.")
      else return response.json({status:"error",reason:"Too many writers! Try later."}).end  
    }  
    next()
  })   
  app.use(function(error, request, response, next) {
      if(!error) return next()
      console.log(error)
      return response.send("Internal server error!")
  })    
})

/* СТАРТОВАЯ */
app.get('/',function(request,response){
  if(request.session.user){
    var fileStream = fs.createReadStream(tplDir + "index.html");
    fileStream.on('data', function (data) { response.write(data) })
    fileStream.on('end', function() { response.end() })       
  } else {
    var fileStream = fs.createReadStream(tplDir + "index-signup.html");
    fileStream.on('data', function (data) { response.write(data) })
    fileStream.on('end', function() { response.end() }) 
  }  
})
app.get('/signin',function(request,response){
  if(request.session.user) return response.redirect("/") 
  var fileStream = fs.createReadStream(tplDir + "index-signin.html");
  fileStream.on('data', function (data) { response.write(data) })
  fileStream.on('end', function() { response.end() })
})
app.get('/forgot-password',function(request,response){
  if(request.session.user) return response.redirect("/")
  var fileStream = fs.createReadStream(tplDir + "index-repair.html");
  fileStream.on('data', function (data) { response.write(data) })
  fileStream.on('end', function() { response.end() })
})
app.get('/about',function(request,response){
  var fileStream = fs.createReadStream(tplDir + "about.html");
  fileStream.on('data', function (data) { response.write(data) })
  fileStream.on('end', function() { response.end() });
})
app.get('/formatting',function(request,response){
  var fileStream = fs.createReadStream(tplDir + "cheet.html");
  fileStream.on('data', function (data) { response.write(data) })
  fileStream.on('end', function() { response.end() });
})

/* registration */
app.post('/signup',function(request,response){
  var signUp = require('./inc/newaccount')
  signUp(request.body,function(e,uid){
    if(e) return response.json({status:"error",reason:e.message}).end
    request.session.user = uid
    return response.json({status:"success"}).end 
  })
})

/* authorization */
app.post('/signin',function(request,response){
  var signIn = require('./inc/authorization')
  signIn(request.body.login,request.body.password,function(e,uid){
    if(e) return response.json({status:"error",reason:e.message}).end
    request.session.user = uid
    return response.json({status:"success"}).end 
  })
})

/* reset password */
app.post('/repair',function(request,response){
  var repair = require('./inc/repair')
  if(request.session.username) return response.json({status:"error",reason:"Internal server error"}).end
  if(!request.body.email) return response.json({status:"error",reason:"Invalid params"}).end 
  repair(request.body.email,function(e,r){
    if(e) return response.json({status:"error",reason:e.message}).end
    return response.json({status:"success"}).end  
  })
})

/* signout */
app.get('/signout',function(request,response){
  request.session.user = null
  return response.redirect("/")
})

/* Новый пост */
app.get('/write',function(request,response){
  if(!request.session.user) return response.redirect("/")
  var newPost = require('./inc/newpost')
  newPost(request.session.user,null,function(e,post){
    if(e) return response.send("500: " + e.message)
    return response.redirect("/e/"+post)
  })
})

/* РЕДАКТОР */
app.get('/e/:ID',function(request,response){
  // валидация браузера и устройства
  /* var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(request.headers['user-agent']);
  var isSupported = /Firefox|Chrome/i.test(request.headers['user-agent'])
  if(isMobile && !isSupported) return response.end("Error: Unsupported device or browser!") */ 
  if(!request.session.user) return response.redirect("/")
  var getPost = require('./inc/getpost')
  getPost(request.session.user,request.params.ID,"edit",function(e,post){
    if(e) return response.end("Error: " + e.message) 
    return response.render('editor',post)  
  })
})

/* update post/draft */
app.post('/u',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var updatePost = require('./inc/updatepost')
  updatePost(request.session.user,request.body.post,request.body.title,request.body.subtitle,request.body.content,false,function(e,r){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success"}).end 
  })
})

/* save post */
app.post('/save',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var updatePost = require('./inc/updatepost')
  updatePost(request.session.user,request.body.post,request.body.title,request.body.subtitle,request.body.content,true,function(e,r){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success",resource:r}).end 
  })
})

/* save draft as post */
app.post('/s',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var noDraft = require('./inc/nodraft')
  noDraft(request.session.user,request.body.post,function(e,r){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success"}).end 
  })
})

/* remove post/draft */
app.post('/remove',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var removePost = require('./inc/remove')
  removePost(request.session.user,request.body.post,function(e,r){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success"}).end 
  })
})

/* ЧИТАЛКА */
app.get('/r/:ID',function(request,response){
  var getPost = require('./inc/getpost')
  getPost(request.session.user,request.params.ID,"read",function(e,post){
    if(e) return response.end("Error: " + e.message)
    return response.render('reader',post)  
  })
})

/* СПИСОК */
app.get('/list',function(request,response){
  if(!request.session.user) return response.redirect("/")
  var stuffList = require('./inc/list')
  stuffList(request.session.user,null,request.query.type,function(e,resp){
    if(e) return response.end("Error: " + e.message)
    return response.render('list',resp) 
  })
})

app.post('/list',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var stuffList = require('./inc/list')
  stuffList(request.session.user,request.body.skip,request.body.type,function(e,resp){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success",reason:resp}).end     
  })
})

/* НАСТРОЙКИ */
app.get('/settings',function(request,response){
  if(!request.session.user) return response.redirect("/")
  var userData = require('./inc/user')
  userData(request.session.user,function(e,resp){
    if(e) return response.end("Error: " + e.message)
    return response.render('settings',resp) 
  })
})

app.post('/settings',function(request,response){
  if(!request.session.user) return response.json({status:"error",reason:"bad auth"}).end 
  var changeSettings = require('./inc/settings')
  changeSettings(request.session.user,request.body,function(e,resp){
    if(e) return response.json({status:"error",reason:e.message}).end 
    return response.json({status:"success"}).end  
  })
})


/* API */
app.get('/api/list',function(request,response){
  if(!request.query.key) return response.json({status:"error",reason:"invalid API key"}).end 	
  var stuffList = require('./inc/api.list')
  stuffList(request.query.key,request.query.skip,request.query.type,function(e,resp){
    if(e) return response.json({status:"error",reason:e.message}).end
    return response.json({status:"success",response:resp}).end
  })
})


/* 404 */
app.get("*", function(request, response) { response.end("404! Not found") })
app.post("*", function(request, response) { response.json({status:"error",reason:"invalid resource"}).end })


var server = app.listen(3000,"atmospheri.ca")