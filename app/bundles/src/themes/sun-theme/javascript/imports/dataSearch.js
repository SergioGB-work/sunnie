function dataSearch(){	

	var fields = '';

	$('[data-search="true"]').each(function(){

		$.each($(this).find('input').data(), function(key, value) {
			
			fields += key + '=' + value + '&';

		});

		var search = window.location.search.replace('?','');

		filtersSearch = search.split('&');
		
		for(var i=0;i<filtersSearch.length;i++){

			filter = filtersSearch[i].split('=');

			if(fields.indexOf(filter[0] + '=') < 0 && filter[0] != 'query'){

				fields += filtersSearch[i] + '&';
			}

			if(filter[0] == 'query'){
				$(this).find('input').val(filter[1]);
			}			

		}

	});	

	$('[data-search="true"] .input-group-addon').click(function(){
		
		var query ='?';

		if($(this).val() != ''){
			query += 'query=' + $(this).val() + '&';
		}		
		
		window.location.href = window.location.origin + window.location.pathname + query + fields;
		
	});

	$('[data-search="true"] input').keypress(function(e){
		
		var query = '?';

		if(e.which == 13){
			
			if($(this).val() != ''){
				query += 'query=' + $(this).val() + '&';
			}

			window.location.href = window.location.origin + window.location.pathname + query + fields;
		
		}
	});
}