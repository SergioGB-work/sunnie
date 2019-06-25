var pathname = window.location.pathname.split('/');
var siteURL = pathname[1];
pathname = pathname.slice(3,pathname.length).join('');

$(document).ready(function(){

	$('.component-languageSelector [data-lang]').each(function(){
		var lang = $(this).data('lang');

		$(this).attr('href','/'+ siteURL + '/' + lang +'/' + pathname + window.location.search);
	});

});