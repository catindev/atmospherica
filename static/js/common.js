
$(function () {

    var timer = null;
    var istimer = false;
    function statusBox(text,hide){
        $(".status-box").hide().text(text).fadeIn(500)  
        if(hide && typeof hide === "number" && hide != 0){ 
            if(istimer) { clearTimeout(timer) }
            timer = setTimeout( function() { $(".status-box").fadeOut(500) } , hide)
            istimer = true
        } else {istimer = false}
    }


    $(".status-box").click(function(){ $(this).hide(); })

    $("#sign-butoon").click(function(){
        var action = $(this).attr("atype");
        var query = {};
        $('#signup-form input').each(function(n,field){
            var key = $(field).attr('param');
            var value = $.trim($(field).val());
            if(value != ""){ query[key] = value
            } else { statusBox("Error! "+key+" is empty!",7000); query={}; return false; }
        });
        if($.isEmptyObject(query) === false){
            $.post("/"+action,query,function(resp){
                if(resp.status === "error") statusBox("Uh oh! "+resp.reason,7000)
                else {
                    if(action === "repair") statusBox("New password emailed!",7000)
                    else location.href = "/"   
                }
            })
        }
    });

    $("#save-settings").click(function(){
        var query = {};
        $('#settings-form input').each(function(n,field){
            var key = $(field).attr('param');
            var value = $.trim($(field).val());
            if(value != "") query[key] = value
        });
        if($.isEmptyObject(query) === false){
            $.post("/settings",query,function(resp){
                if(resp.status === "error") statusBox("Uh oh! "+resp.reason,7000)
                else location.href = "/"
            })
        }
    });

    $('body').on('keyup', '#signup-form input', function(a){ 
     if(a.which===13){ $("#sign-butoon").trigger('click'); } 
    });   

});