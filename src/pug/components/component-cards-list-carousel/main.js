$(document).ready(function(){
        
    $(".component-cards-list-carousel .component-content").owlCarousel({
        navigation: true,
        navigationText:['<span class="fa fa-angle-left icon-13x" aria-hidden="true"></span>','<span class="fa fa-angle-right icon-13x" aria-hidden="true"></span>'],
        slideSpeed : 300,
        paginationSpeed : 400,
        pagination: false,
        items : 4, //10 items above 1000px browser width
        itemsDesktop : [1000,4], //5 items between 1000px and 901px
        itemsDesktopSmall : [900,3], // betweem 900px and 601px
        itemsTablet: [600,2], //2 items between 600 and 0
        itemsMobile : [480,1]
     });
    
})