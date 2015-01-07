/* перемешать элементы массива или строку */
var shuffle = require("./shuffle")
var crypto = require('crypto')

module.exports = function (str) {
	str = str + ""
    var small = crypto.createHash('md5').update(str + new Date().getTime()+(Math.floor(Math.random() * (9999 - 111 + 1)) + 111)+'').digest("hex")
    var big = crypto.createHash('md5').update(str + (Math.floor(Math.random() * (9999 - 111 + 1)) + 111)+new Date().getTime()+'').digest("hex")
    var jid = shuffle(shuffle(big.toUpperCase().replace(/[^A-Za-z]/g,"") + small.toLowerCase().replace(/[^A-Za-z]/g,"")))
    jid = jid.substr(0,4)+(Math.floor(Math.random() * (9999 - 111 + 1)) + 111)
    return jid
}