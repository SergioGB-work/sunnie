$(document).ready(function(){
        
    $(".component-card-list-carousel").owlCarousel({
        navigationText:['<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>','<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'],
        slideSpeed : 300,
        paginationSpeed : 400,
        pagination: false,
        items : 4,
        itemsDesktop : 4,
        itemsDesktopSmall : 3, 
        itemsTablet: 3,
        itemsMobile :  2
     });
    
})