var pathname = window.location.pathname.split('/'),
	pageLang = pathname[1];

$(document).ready(function(){

	pathname = pathname.slice(2,pathname.length).join('');

	$('.component-languageSelector [data-lang]').each(function(){

		var lang = $(this).data('lang');
		$(this).attr('href','/'+ lang +'/' + pathname + window.location.search);
	});

});