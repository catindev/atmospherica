/* проверяем девайс и браузер */

module.exports = function(error, request, response, next) {
      if(!error) return next()
      console.log(error)
      return response.render('error',{message:"Internal server error!"})
  }