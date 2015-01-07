$(document).ready(function(){

    $('.text-box').autosize().placeholder().endtyping(function(){
        $(".status-box").hide();
        $("#editor").attr("changes","1");
        var t = $.trim( $('#post_title').val() );
        var s = $.trim( $('#post_subtitle').val() );
        var c = $.trim( $('#post_content').val() );
        var pid = $("#editor").attr("pid");
        $('.saving').show(); 
        $.post("/u",{title:t,subtitle:s,content:c,post:pid},function(resp){
            if("error" === resp.status) return statusBox(resp.reason,7000)
            else {
                $(".saving").fadeOut() 
                $("#editor").attr("changes","0");
            }    
        })  
    });

    // block 13 in titles
    $('.text-box').on('keypress',function(e){
      var c = e.keyCode;
      if("post_content" != $(this).attr("id")) {
        var text = $(this).val(), text = text.replace(/\s+/g, " ");
        $(this).val(text);
        13 === c && e.preventDefault()
      }               
    });

    $('#remove-post').click(function(){
        $(".status-box").hide();
        if($(this).attr("enabled") === "1"){
            if (confirm("Are you sure? Deleted posts cannot be recovered")) {
                $(this).attr("enabled","0");
                var pid = $("#editor").attr("pid"); 
                $.post("/remove",{post:pid},function(resp){
                    if("error" === resp.status) return statusBox("Uh oh! " + resp.reason,7000)
                    else { $(window).unbind(); location.href = "/" } 
                }) 
            } else return false
        } else return false
    });

    $('#save-post').click(function(){
        $(".status-box").hide();
        var sb = $(this);
        var pid = $("#editor").attr("pid"); 
        var t = $.trim( $('#post_title').val() );
        var s = $.trim( $('#post_subtitle').val() );
        var c = $.trim( $('#post_content').val() );
        var ischange = $("#editor").attr("changes");        
        if(sb.attr("enabled") === "1"){
            sb.attr("enabled","0");
            $.post("/save",{title:t,subtitle:s,content:c,post:pid},function(resp){
                if("error" === resp.status) {
                    statusBox(resp.reason,7000);
                    sb.attr("enabled","1");
                } else { 
                    $(window).unbind();
                    location.href = "/r/"+pid;
                }                 
            })              
        } else return false    
    });        

    // save before exit
    $(window).bind("beforeunload", function() {
        var isc = $("#editor").attr("changes");
        var t = $.trim( $('#post_title').val() );
        var s = $.trim( $('#post_subtitle').val() );
        var c = $.trim( $('#post_content').val() );  
        var pid = $("#editor").attr("pid");        
        if(ischange === "1") $.post("/u",{title:t,subtitle:s,content:c,post:pid},function(resp){ }) 
    });
    
    // fix chrome bug
    $(window).on("load", function() {
        var content = $('#post_content').val(); 
        if(content && content.length>0) $('#post_content').val(content+'\n').trigger('autosize.resize');
    });

});