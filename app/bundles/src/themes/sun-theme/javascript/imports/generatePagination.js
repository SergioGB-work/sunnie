// GENERALIZACION DE PAGINACION
// Se puede establacer una paginación automática para aquellos listados de datos que haya definido un data-has-pagination="true"
// Los parametros data deben colocarse en elemento raiz del listado

// @param el -> elemento raiz del listado que contiene los parametros data de configuracion
// @param data-service -> Servicio del que debe recuperar el total de datos a paginar
// @param data-items-per-page -> Numero de items por pagina
// @param data-target -> Selector css sobre el que se cargará la paginación
// @param data-callback -> Función que se ejecuta cuando un usuario pulsa sobre una pagina. Como mino, esta funcion recibira la pagina a cargar y los items_per_page
// @param data-method -> Método de envío del formulario (GET/POST)
// @param data-content -> Contenido adicional que debe enviarse a la funcion callback. Por ejemplo query de busqueda.
// @param data-template -> selector CSS de la Template JSRender sobre la que se cargarán los datos devueltos
// @param data-content-target -> selector CSS donde se cargara el contenido estructurado con la template



function generatePagination(data, el, totalItems) {

	var data = data,
		pagination_target = el.pagination_target,
		target = el.target,
		items_per_page = getParams['filter[limit]'] || el.items_per_page,
		noReload = el.noReload,
		rel = el.rel ? '_' + el.rel : '';
	
	var totalPages = totalItems / items_per_page;

	if(items_per_page == 0){
		items_per_page=totalItems;
	}

	if (totalPages % 1 != 0) {
		totalPages = parseInt(totalPages) + 1;
	}


	var search = window.location.search.replace('?', '');

	var filtersSearch = search.split('&');

	var href = '';
	var currentPage = 1;

	for (var i = 0; i < filtersSearch.length; i++) {

		filter = filtersSearch[i].split('=');

		if (filter[0].indexOf("filter[skip]"+rel) < 0 && filter[0] != '') {
			
		}
		else if (filter[0] != '') {
			currentPage = (filter[1] / items_per_page) + 1;
		}
	}

	if ($(pagination_target + ' .bootpag').length <= 0 || noReload==true) {

		$(pagination_target).parents(target).find('.totalResults').text(totalItems);
		$(pagination_target).parents(target).find('.initInterval').text(parseInt((currentPage - 1) * items_per_page + 1));
		$(pagination_target).parents(target).find('.lastInterval').text(totalItems < parseInt((currentPage - 1) * items_per_page) + parseInt(items_per_page) ? totalItems : parseInt((currentPage - 1) * items_per_page) + parseInt(items_per_page));

		if (totalPages > 1) {
			$(pagination_target).bootpag({
				total: totalPages,
				maxVisible: 5,
				page: currentPage
			}).on('page', function (event, num) {				
				showLoading();
				
				var search = window.location.search.replace('?', '');
				var filtersSearch = search.split('&');

				for (var i = 0; i < filtersSearch.length; i++) {

					filter = filtersSearch[i].split('=');

					if (filter[0].indexOf("filter[skip]"+rel) < 0 && filter[0] != '') {
						href += '&' + filtersSearch[i];
					}
				}

				if(noReload != true){
					window.location.href = '?filter[skip]'+rel+'=' + parseInt((num - 1) * items_per_page) + href;
				}
				else{
					window.history.pushState('','','?filter[skip]'+rel+'=' + parseInt((num - 1) * items_per_page) + href);
					reloadComponents();
				}
			});
		}
	}
}