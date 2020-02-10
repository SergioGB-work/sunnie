function filters(el) {
	var rels = el.data('rel') ? el.data('rel').split(',') : [];
	var noReload = el.attr('data-noreload') || '';

	el.find('[data-filter]').each(function () {
		var filterParent = $(this);
		var dataFilter = [$(this).data('filter')];

		for (var i = 0; i < rels.length; i++) {
			dataFilter[i] = $(this).data('filter') + '_' + rels[i];
		}

		var search = window.location.search.replace('?', '');

		filtersSearch = search.split('&');

		$(this).find('[data-filter-value]').each(function () {

			var finalHref = '';

			for (var i = 0; i < filtersSearch.length; i++) {

				filter = filtersSearch[i].split('=');

				if (dataFilter.indexOf(filter[0]) >= 0) {
					var dataFilterValue = filterParent.find('[data-filter-value="' + filter[1] + '"]');
					if (dataFilterValue.parent().is('select')) {
						dataFilterValue.prop('selected', 'selected');
					}
					else {
						dataFilterValue.parent().addClass('active');
					}

					filterParent.find('.filterValue').text(dataFilterValue.text());
				}
			}

			if (($(this).data('filter-value').toString() != '' && !filterParent.hasClass('checkbox')) || ($(this).data('filter-value').toString() != '' && filterParent.hasClass('checkbox') && !filterParent.hasClass('active'))) {

				for (var i = 0; i < dataFilter.length; i++) {

					var filterValue = $(this).data('filter-value');

					if ($(this).data('filter-value').toString().indexOf('=') < 0) {
						filterValue = '=' + $(this).data('filter-value');
					}

					finalHref += dataFilter[i] + filterValue + '&';
				}
				finalHref = finalHref.substring(0, finalHref.length - 1);
			}
			for (var i = 0; i < filtersSearch.length; i++) {

				filter = filtersSearch[i].split('=');

				if (filter[0] != "filter[skip]") {

					if (($(this).data('filter-value').toString() != '' && (!filterParent.hasClass('checkbox'))) || ($(this).data('filter-value').toString() != '' && (filterParent.hasClass('checkbox')) && (!filterParent.hasClass('active')))) {
						if (finalHref.indexOf(filter[0] + '=') < 0) {

							if (finalHref != '') {
								finalHref += '&';
							}

							finalHref += filtersSearch[i];
						}
					}

					else if ((dataFilter.indexOf(filter[0]) < 0 && !filterParent.hasClass('checkbox')) || (dataFilter.indexOf(filter[0]) < 0 && filterParent.hasClass('checkbox') && filterParent.hasClass('active'))) {


						if (finalHref != '') {
							finalHref += '&';
						}
						finalHref += filtersSearch[i];
					}

				}
			}

			if ($(this).is('a')) {
				$(this).attr('href', '?' + finalHref);
				if (filterParent.hasClass('active')) {
					$(this).attr("href", $(this).attr("href").replace('%20ASC', '%20DESC'));
					$(this).children("i.order").addClass('orderUp');
				}
			}

		});
	});

	//Aplicamos el noreload si esta activo para los filtros de tipo enlace
	if(noReload == 'true'){
		el.find('[data-filter-value]').each(function () {
			if($(this).is('a')){
				$(this).click(function(e){
					e.preventDefault();
					var href = $(this).attr('href');
					window.history.pushState('','',href);
					reloadComponents();
				})	
			}
		});	
	}	
}