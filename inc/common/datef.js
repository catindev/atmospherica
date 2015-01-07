module.exports = function () {
  this.dateMarkers = { 
     d:['getDate',function(v) { return v }], 
         m:['getMonth',function(v) { return ("0"+v).substr(-2,2)}],
         n:['getMonth',function(v) {
             var mthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
             return mthNames[v];
             }],
         w:['getDay',function(v) {
             var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
             return dayNames[v];
             }],
         y:['getFullYear'],
         H:['getHours',function(v) { return ("0"+v).substr(-2,2)}],
         M:['getMinutes',function(v) { return ("0"+v).substr(-2,2)}],
         S:['getSeconds',function(v) { return ("0"+v).substr(-2,2)}],
         i:['toISOString',null]
  };

  this.format = function(date, fmt) {
    var dateMarkers = this.dateMarkers
    var dateTxt = fmt.replace(/%(.)/g, function(m, p){
    var rv = date[(dateMarkers[p])[0]]()

    if ( dateMarkers[p][1] != null ) rv = dateMarkers[p][1](rv)

    return rv
  });

  return dateTxt
  }
}