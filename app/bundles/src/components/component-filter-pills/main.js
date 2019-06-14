$(document).ready(function(){

	if($('.component-filter-pills').length > 0){

		$('.component-filter-pills').each(function(){

			var component = $(this);
			var ignored = component.find('[data="filters"]').data('ignored') ? component.find('[data="filters"]').data('ignored').split(',') : []


			if(component.find('[data="filters"][data-rel]').length > 0){
			
				component.find('[data="filters"][data-rel]').each(function(){

					var valueRel = $(this).data('rel');
					var filters = JSON.stringify(getParams);
					filters = JSON.parse(filters);

					Object.keys(filters).forEach(function(key) {
						if(key.indexOf('_' + valueRel) < 0){
							delete filters[key];
						}

					});


					filters = JSON.parse(JSON.stringify(filters).split('_'+valueRel).join(''));

					ignored.forEach(function(key) {
						
						if(filters[key] !== undefined && filters[key] !== null && filters[key] != ''){
							delete filters[key];
						}

					});

					$('#filterPillsTemplate').tmpl({"data":filters}).appendTo(component.find('.filters-container[data-rel="'+valueRel+'"]'));

				});
			}
			else{

				var filters = getParams;
				ignored.forEach(function(key) {
					
					if(filters[key] !== undefined && filters[key] !== null && filters[key] != ''){
						delete filters[key];
					}

				});

				$('#filterPillsTemplate').tmpl({"data":filters}).appendTo(component.find('.filters-container'));				

			}

		});

		filters($('[data="filters"]'));
	};

});