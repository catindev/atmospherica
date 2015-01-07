var markdown = require( "../../node_modules/markdown" ).markdown

module.exports = function(text){
  var tree = markdown.toHTMLTree(text);
  var isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]";
  };
  function extract_attr( jsonml ) {
    return isArray(jsonml)
        && jsonml.length > 1
        && typeof jsonml[ 1 ] === "object"
        && !( isArray(jsonml[ 1 ]) )
        ? jsonml[ 1 ]
        : undefined;
  };

  var filter = function(node) {
    if ( typeof node === "string" )
      return node;
    var n = extract_attr( node ) === undefined ? 1 : 2;

    for (; n < node.length; ++n ) {
      var child = node[ n ],
          attrs = extract_attr( child );

      if ( typeof child === "string" ) {
        continue;
      }
      switch( child[ 0 ] ) {
        case 'img':
          //node[ n ] = attrs && attrs.alt || '';
          node[ n ] = ''; 
        case 'code':
          node[ n ] = '';          
        default:
          filter( child );
      }
    }

    return node;
  };

  return markdown.renderJsonML( filter( tree ) );

}