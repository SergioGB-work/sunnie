function activeCurrentNavigationPage(){
/** CONTROL ACTIVE MENU **/
	var currentURL = window.location.pathname;
	$('#navigation li a').each(function(){

		var href = $(this).attr('href').split('?');
		href = href[0];

		if(currentURL == href){
			$(this).parents('li').addClass('active');
		}

	});
}