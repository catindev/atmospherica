var Sync = require("../node_modules/sync"),
    config = require("../config.json"),
    dbAPI = require("./dbprovider"),
    ObjectID = require("../node_modules/mongodb").ObjectID,
    log = require("util").log,
    markdown = require("./common/render"),
    df = require("./common/datef"), datef = new df;

module.exports = function(user,post,callback) {
  Sync(function() {
    result = null;
    try { // главный ловец ошибок
      var db = dbAPI.open.sync(dbAPI), users = db.collection.sync(db, "users"), posts = db.collection.sync(db, "posts");

      // user works
      if(user){
        user = new ObjectID(user)
        user = users.findOne.sync(users, {_id:user}, {})
        if(!user) return callback(Error("bad auth"), null)
      } else return callback(Error("bad auth"), null)
      
      // post works
      if(post) {
        if(post = posts.findOne.sync(posts, {id:post}, {}), !post) return callback(Error("Not found"), null)
      } else return callback(Error("Not found"), null)

      post.user = db.dereference.sync(db,post.user) 

      // checking..
      if(post.user._id.toString() != user._id.toString()) return callback(Error("Access denied!"), null)

      // removing
      return posts.remove.sync(posts, {_id:post._id, $isolated:1}, !1), callback(null,"success")
      
    }catch(err) { // главный обработчик ошибок
      return log("Internal error in remove module!"), console.log(err.stack), callback(Error("Internal server error"), null)
    }
  })
};