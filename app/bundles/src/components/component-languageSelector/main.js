$(document).ready(function(){

	$('.component-languageSelector [data-lang]').each(function(){

		var lang = $(this).data('lang');
		var pathname = window.location.pathname.split('/');
		pathname = pathname.slice(2,pathname.length).join('');
		$(this).attr('href','/'+ lang +'/' + pathname + window.location.search);

	});

});