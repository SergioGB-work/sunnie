$(document).ready(function(){
        
    $(".component-slider .component-content").owlCarousel({

        navigationText:['<span class="fa fa-angle-left" aria-hidden="true"></span>','<span class="fa fa-angle-right" aria-hidden="true"></span>'],
        navigation : true, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true,
        afterAction: function(owl){

            if($(window).width() < 768){
                $(owl).find('.fragment img').each(function(){
                    if($(this).data('responsive-src') && $(this).data('responsive-src') != $(this).attr('src')){
                        $(this).attr('src',$(this).data('responsive-src'));
                    }
                });
            }

            else{
            	$(owl).find('.fragment img').each(function(){

 					if($(this).data('src') && $(this).data('src') != $(this).attr('src')){
                        $(this).attr('src',$(this).data('src'));
                    }            		

            	});
            }
        }        
     });
    
})