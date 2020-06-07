$(document).ready(function(){

	$('.component-languageSelector [data-lang]').each(function(){

		var pathname = window.location.pathname.split('/'+$('html').attr('lang') + '/');

		var lang = $(this).data('lang');

		$(this).attr('href', pathname[0] + '/' + lang +'/' + pathname[1] + window.location.search);
	});

});