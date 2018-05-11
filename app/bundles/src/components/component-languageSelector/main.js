$(document).ready(function(){

	$('.component-languageSelector [data-lang]').each(function(){

		var lang = $(this).data('lang');
		var pathname = window.location.pathname.split('/');
		var site = pathname[1];
		pathname = pathname.slice(3,pathname.length).join('');
		$(this).attr('href','/'+ site +'/'+ lang +'/' + pathname + window.location.search);

	});

});