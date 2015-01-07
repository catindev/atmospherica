/* проверяем девайс и браузер */

module.exports = function(request,response,next){
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(request.headers['user-agent']);
    var isSupported = /Firefox|Chrome/i.test(request.headers['user-agent'])
    if(!isMobile && isSupported) next()
    response.send("Unsupported device or browser!")
  }