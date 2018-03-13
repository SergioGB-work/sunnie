$(document).ready(function(){
        
    $(".component-cards-list-carousel .component-content").owlCarousel({
        navigation: true,
        navigationText:['<span class="fa fa-angle-left icon-13x" aria-hidden="true"></span>','<span class="fa fa-angle-right icon-13x" aria-hidden="true"></span>'],
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