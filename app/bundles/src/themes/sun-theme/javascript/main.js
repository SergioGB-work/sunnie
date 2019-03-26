var api = "http://localhost:3000";
var items_per_page_default = 10;
var defaultImg = './images/default-img.png';

$(document).ready(function(){

	/** CONTROL ACTIVE MENU **/
	var currentURL = window.location.pathname;
	currentURL = currentURL.split('/');
	currentURL = currentURL.splice(2);
	currentURL = './' + currentURL.join('/');
	currentURL = currentURL.split('?');
	currentURL = currentURL[0];

	$('#navigation li a').each(function(){

		var href = $(this).attr('href').split('?');
		href = href[0];

		if(currentURL == href){
			$(this).parents('li').addClass('active');
		}

	});

	// GENERALIZACION DE FORMULARIOS
	// Cuando un formulario es enviado, recoge todos los datos y los envía al servicio seleccionado
	// Los name de los inputs deben llamarse igual que los campos en BD
	
	// @param data-action -> Servicio al que se enviarán los datos del formulario
	// @param data-method -> Método de envío del formulario (GET/POST)
	// @param data-callback -> Nombre de la función que se ejecutará al invocarse el evento complete de Ajax. El data devuelvo se le envía a la función como parametro

	$(document).on('submit','form',function (e) {
		e.preventDefault();

		var url, method;
		var data = {};
		var form = $(this);

		var rel = $(this).find('[data="filters"][data-rel]').data('rel') || '';

		if (rel != '' && rel !== undefined) {
			rel = rel.split(',');

			$.each(rel, function (index, elem) {
				rel[index] = '_' + rel[index];
			});
		}

		var emptyVars = '';

		form.find('input:not([type="radio"]):not([type="file"]):not([name$="-fileHidden"]):not([type="submit"]),select,textarea,input[type="radio"]:checked').each(function () {

			var value = $(this).val();
			var name = $(this).attr('name');
			if (form.data('form-filter') != true || value != '') {
				if (rel != '') {
					$.each(rel, function (index, elem) {
						data[name + elem] = value;
					})
				}
				else {
					data[name] = value;
				}
			}

			else if (form.data('form-filter') == true && value == '') {
				if (rel != '') {
					$.each(rel, function (index, elem) {

						if (value == '') {
							emptyVars += name + elem + '&';
						}

					})
				}
				else {

					if (value == '') {
						emptyVars += name + '&';
					}
				}
			}

		});


		var filesInput = form.find('input[type="file"]');

		if(filesInput.length > 0){
			var dataFormData = new FormData();	

			form.find('input[type="file"]').each(function(){
				dataFormData.append($(this).attr('name'), $(this).get(0).files[0]);
			});

			for ( var key in data ) {
    			dataFormData.append(key, data[key]);
			}

			data = dataFormData;
		}	

		if (form.data('form-filter') != true) {
			url = form.attr('data-action');
			method = form.data('method');				
			var params = { "service": url, "method": method, "aditionalData": data, "callback": form.data('callback'), "content":form.data('content')};
			getData(params);
		}
		else {
			var filters = JSON.stringify(data);
			filters = filters.replace(/:/g, '=').replace(/"/g, '').replace(/,/g, '&').replace('{', '').replace('}', '').replace(/%5Blike%3D%5D=/g, '=[like]%3D');
			var search = window.location.search.replace('?', '');
			filtersSearch = search.split('&');
			for (var i = 0; i < filtersSearch.length; i++) {
				filter = filtersSearch[i].split('=');
				if (filters.indexOf(filter[0] + '=') < 0 && emptyVars.indexOf(filter[0]) < 0 && filter[0] != 'filter[skip]') {
					filters += '&' + filter[0] + '=' + filter[1]
				}
			}
			filters = (filters[0] == '&') ? filters.substr(1) : filters;
			url = form.attr('data-action') + '?' + filters;
			window.location.href = url;
		}
	});

	// GENERALIZACION DE LISTADOS DE DATOS
	// @param data-load -> Indica que el elemento se cargará con datos dinamicos 

	$('[data-load="true"]').each(function(e){
		filterContentByRol();
		dataList($(this));
	});	

	// GENERALIZACION DE BUSQUEDAS

	$('[data-search="true"]').each(function(e){
		dataSearch();
	});	

	// ACTIVACION DE POPOVERS
	popover();

	// GESTION DE CONTENIDO POR ROLES
	filterContentByRol();

	// LOGOUT DE LA PLATAFORMA
	$('.logout').click(function(){

		$.ajax({
			url: api + '/usuarios/logout',
			type: 'post',
			dataType: 'json',
			data: {idSession: $.cookie('id_session')},
			complete:function(data){	
				clearBrowserData();
				window.location.href = "/${{ default.lang }}$";
	        }
		});			

	});

	//Anade el nombre del usuario en la cabecera
	if(($('#user .user-data-box .user-name').length>0)&&($.cookie('username'))){
		$('#user .user-data-box .user-name').text($.cookie('username'));
	}	

	//AJAX GLOBALS
	//Cada vez que se realiza una peticion AJAX muestra loading y cuando termina se oculta
	$(document).ajaxSend(function (event, request, settings) {
	    showLoading();
	});

	$(document).ajaxComplete(function () {
	    hideLoading();
	    setAllImgDefault();
	});	

	$(document).ajaxError(function () {
	    hideLoading();
	    setAllImgDefault();
	});	

	//FILTROS DE LISTADOS

	if ($('[data="filters"]').length > 0) {

		$('[data="filters"]').each(function () {
			filters($(this));
		});
	};	

});

$(window).load(function(){
	setAllImgDefault();
});

// IMAGENES POR DEFECTO
// Establece una imagen por defecto para todas las imagenes rotas
function setAllImgDefault(){
	$('img').on('load',function(){
		if($(this).get(0).naturalWidth == 0){
			$(this).attr('src', defaultImg);
		}
	});
}

function setImgDefault(el){
	$(el).attr('src', defaultImg);
}	

function popover(){
	$("[data-toggle=popover]").popover({
 		html : true,
        content: function() {
          var content = $(this).attr("data-popover-content");
          return $(content).get(0).outerHTML;
        }
	});

	$("[data-toggle=popover]").children().click(function(){

		$(this).parents($("[data-toggle=popover]")).focus();

	});	

}

// LISTADOS DE DATOS
	// Devuelve el listado comppleto de datos obtenidos de un servicio
	// @param service -> servicio rest del que se obtendrán los datos a mostrar
	// @param template -> selector CSS de la Template Jquery tmpl sobre la que se cargarán los datos devueltos
	// @param target -> selector CSS donde se cargara el contenido estructurado con la template
	// @param page -> pagina a cargar del servicio invicado. 0 si se quiere cargar todos los resultados sin paginar
	// @param items_per_page -> numero de elementos por pagina. 0 si se quiere cargar todos los resultados sin paginar
	// @param callback -> nombre de la función que se ejecutará al invocarse el evento complete de Ajax. El data devuelvo se le envía a la función como parametro
	// @param content -> parametros adicionales a enviar a la función callback

function getData(el) {

	var filter = '';
	var access_token = $.cookie('id_session') !== undefined ? "Bearer " + $.cookie('id_session') : '';
	var service = el.service,
		method = el.method,
		template = el.template,
		target = el.target,
		page = el.page,
		items_per_page = el.items_per_page,
		aditionalData = el.aditionalData,
		callback = el.callback,
		content = el.content,
		enableGetParams = el.enableGetParams,
		getParamsList = el.getParamsList,
		cache = el.cache,
		rel_group = [''],
		dynamicField = el.dynamicField;

	if (el.rel != '' && el.rel !== undefined) {
		rel_group = el.rel.split(',');
	}

	if (enableGetParams == true || enableGetParams == "true") {
		var params = Object.keys(getParams);
		//Solo para elementos agrupados
		if (rel_group !== undefined) {

			$.each(rel_group, function (index) {

				var rel = rel_group[index];

				if (rel !== undefined && rel != '') {
					rel = '_' + rel;
				}


				if (getParamsList !== undefined && getParamsList.length > 0) {
					params = getParamsList.split(',');

					if (rel !== undefined && rel != '') {
						$.each(params, function (i) {
							params[i] = params[i] + rel
						});
					}
				}

				if (params.length > 0) {
					var count = 0;
					$.each(params, function (i, val) {

						if ((getParams[val] !== undefined && getParams[val] != '' && val.indexOf(rel) > -1)) {

							var key = (rel !== undefined && rel != '' && val.indexOf(rel) > -1) ? val.replace(rel, '') : val;

							if (key == 'order' || key == 'group') {
								filter += '&filter[' + key + ']=' + getParams[val];
							}

							else if (key == 'query') {
								var regexp = new RegExp("searchField\\d*" + rel, 'g');;
								var n = 0;
								$.each(params, function (index, value) {
									if (value.search(regexp) > -1) {
										filter += '&filter[where][and][' + n + '][' + getParams[value] + '][like]=%' + getParams[val] + '%';
										n++;
									}
								})
								count++;
							}

							else if (key.indexOf('searchField') < 0 && key != '' && key.indexOf('action') < 0 && key.indexOf('filter') < 0) {
								key = completeGtLtParams(key);
								var value = getParams[val] || '';
								if (value != '') {
									if (value.indexOf('=') < 0) {
										value = '=' + value;
									}

									filter += '&filter[where][and][' + count + '][' + key + ']' + value;
								}
								count++;
							}

							else if (((key != 'filter[limit]') || (key == 'filter[limit]' && (getParams[val] > 0))) && key.indexOf('searchField') < 0) {
								filter += '&' + key + '=' + getParams[val];
							}
						}
					});
				}
			});
		}

	}
	if (page !== undefined && page != '' && page > 0 && filter.indexOf('filter[skip]') <= -1 && getParams['filter[limit]'] != 0) {
		page = ((page - 1) * items_per_page);
		filter += '&filter[skip]=' + page;
	}

	if (items_per_page !== undefined && items_per_page != '' && items_per_page > 0 && filter.indexOf('filter[limit]') <= -1 && (getParams['filter[limit]'] < 0 || getParams['filter[limit]'] === undefined)) {
		filter += '&filter[limit]=' + items_per_page;
	}

	var serviceParams = service.split('?');


	if (serviceParams.length > 1) {
		serviceParams = serviceParams[1].split('&');
		$.each(serviceParams, function (index, value) {

			var key = value.split('=')[0];
			if (filter.indexOf(key) < 0 && getParamsList !== undefined && getParamsList.indexOf(key) > -1) {
				filter += '&' + value;
			}
			else if ((filter.indexOf(key) < 0) && (getParamsList === undefined || getParamsList.length == '')) {
				filter += '&' + value;
			}
		});
	}

	filter = filter.indexOf('&') == 0 ? '?' + filter.substring(1, filter.length) : filter;

	var url = service.split('?')[0] + filter;

	url = url.replace("{idPage}" , $("body").data("page-id"));

	if (cache != true || cache == undefined || sessionStorage.getItem(url + '_${{ default.lang }}$') == '' || sessionStorage.getItem(url  + '_${{ default.lang }}$') == null) {

		var jsonData = aditionalData instanceof FormData ? aditionalData : JSON.stringify(aditionalData);
		var contentType = aditionalData instanceof FormData ? false : "application/json";
		var timeout = 600000; // tiempo de espera por defecto de la peticion	

		var getURL = $.ajax({
			url: url,
			type: method,
			data: jsonData,
			crossDomain: true,
			processData: false,
			contentType: contentType,
			cache: false,
			xhrFields:  {
				withCredentials: true
			},
			timeout: timeout,
			headers: {	
				"Authorization": access_token,
				"Accept-Language": '${{ default.lang }}$'
			},
			success: function (data, textStatus, xhr) {
				console.log(url);
				console.log(jsonData);
				console.log("content:");				
				console.log(content);
				console.log("response:");
				console.log(data);
				console.log("--------------------------------------");
				var dataResponse = data;
				if (cache == true) {
					sessionStorage.setItem(url + '_${{ default.lang }}$', JSON.stringify(dataResponse));
				}
				processData(dataResponse, target, template, callback, content, xhr.getResponseHeader('Pagination-Count'), dynamicField);
	
				if(el.pagination != undefined && el.pagination!=null){
					generatePagination(dataResponse,el.pagination,xhr.getResponseHeader('Pagination-Count'));
				}
			},
			error: function (data) {
				console.log(url);
				console.log(jsonData);
				console.log("content:");				
				console.log(content);
				console.log("response:");
				console.log(data);
				console.log("--------------------------------------");
				var statusCode = data.error.statusCode || data.status,
					code = data.error.code,
					message = data.error.message || data.statusText,
					dataMessage = '';
				if (data.responseJSON != undefined && data.responseJSON !== null) {
					statusCode = data.responseJSON.statusCode;
					message = code = data.responseJSON.code;
					dataMessage = data.responseJSON.data || '';
				}
				error(statusCode, code, message,dataMessage);
			}
		});
	}
	else {
		processData(JSON.parse(sessionStorage.getItem(url + '_${{ default.lang }}$')), target, template, callback, content, '', dynamicField)
	}
}

// GENERALIZACION DE LISTADOS DE DATOS

// @param el -> elemento raiz del listado que contiene los parametros data de configuracion
// @param data-items-per-page -> Numero de items por pagina
// @param data-method -> Método de envío del formulario (GET/POST)
// @param data-content -> Contenido adicional que debe enviarse a la funcion callback. Por ejemplo query de busqueda.
// @param data-template -> selector CSS de la Template Jquery tmpl sobre la que se cargarán los datos devueltos
// @param data-content-target -> selector CSS donde se cargara el contenido estructurado con la template

function dataList(el){
	var el = el;
	var live;
	var service = el.data('service-data') || '',
		items_per_page = el.data('items-per-page'),
		initial_page = el.data('initial-page'),
		callback = el.data('callback') || '',
		method = el.data('method') || 'GET',
		content = el.data('content') || '',
		template = el.data('template') || '',
		target = el.data('target') || '',
		aditionalData = el.data('aditional-data'),
		enableGetParams = el.data('enable-get-params'),
		getParamsList = el.data('get-params-list'),
		liveReload = el.data('live-reload') || 'false',
		timeReload = el.data('time-reload') || 60000,
		rel = el.data('rel') || '';

	var params = {"service":service,"method":method,"template":template,"target":target,"page":initial_page,"items_per_page":items_per_page,"aditionalData":aditionalData,"callback":callback,"content":content,"enableGetParams":enableGetParams,"getParamsList":getParamsList,"rel":rel}

	getData(params);

	clearInterval(live);

	if(liveReload=='true'){
		live=setInterval(getData(params),timeReload);
	}
}

function processData(dataResponse, target, template, callback, content, totalItems, dynamicFieldName) {
	var data = { "data": dataResponse };
	var total = 1;
	if (totalItems !== null && totalItems !== undefined && totalItems > 1) {
		total = totalItems;
		data.data['totalItems'] = total;
	}

	if ((target != '') && (template != '') && (template !== undefined) && (target !== undefined)) {
		$(target).html('');
		$(template).tmpl(data).appendTo(target);
	}

	if ((dynamicFieldName != '') && (dynamicFieldName !== undefined)) {
		setDefaultGetParams(dynamicFieldName);
	}

	if ((callback != '') && (callback !== undefined)) {

		var exec = callback + '(' + JSON.stringify(dataResponse) + ')';

		if (content != '') {

			if (typeof (content) == 'object') {
				content = JSON.stringify(content);
			}

			exec = callback + '(' + JSON.stringify(dataResponse) + ',' + content + ',' + total + ')';

		}
		var f = eval(exec);
	}
}

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
// @param data-template -> selector CSS de la Template Jquery tmpl sobre la que se cargarán los datos devueltos
// @param data-content-target -> selector CSS donde se cargara el contenido estructurado con la template

function dataList(el) {
	var el = el;
	var live;
	var service = el.data('service-data') || '',
		items_per_page = el.data('items-per-page'),
		initial_page = el.data('initial-page'),
		callback = el.data('callback') || '',
		method = el.data('method') || 'GET',
		content = el.data('content') || '',
		template = el.data('template') || '',
		target = el.data('target') || '',
		aditionalData = el.data('aditional-data'),
		enableGetParams = el.data('enable-get-params'),
		getParamsList = el.data('get-params-list'),
		liveReload = el.data('live-reload') || 'false',
		timeReload = el.data('time-reload') || 60000,
		cache = el.data('cache') || 'false',
		rel = el.data('rel') || ''
		dynamicField = el.data('get-default-value') || '';
	
	var params = { "service": service, "method": method, "template": template, "target": target, "page": initial_page, "items_per_page": items_per_page, "aditionalData": aditionalData, "callback": callback, "content": content, "enableGetParams": enableGetParams, "getParamsList": getParamsList, "rel": rel, "cache": cache, "dynamicField": dynamicField};

	if(el.data('has-pagination')==true){	
		var	service_data_all_pagination = el.data('pagination-service-data-all') || el.data('service-data') || '',
			items_per_page_pagination = el.data('pagination-items-per-page') || el.data('items-per-page'),
			initial_page_pagination = el.data('pagination-initial-page') || el.data('initial-page'),
			pagination_target_pagination = el.data('pagination-container-target') || '.pagination',
			service_data_pagination = el.data('pagination-service-data') || el.data('service-data') || '',
			method_pagination = el.data('pagination-method') || el.data('method') || '',
			content_pagination = el.data('pagination-content') || el.data('content') || '',
			template_pagination = el.data('pagination-template') || el.data('template') || '',
			target_pagination = el.data('pagination-target') || el.data('target') || '',
			callback_pagination = el.data('pagination-callback') || el.data('callback') || '',
			aditionalData_pagination = el.data('pagination-aditional-data') || el.data('aditional-data') || '',
			enableGetParams_pagination = el.data('pagination-enable-get-params') || el.data('enable-get-params') || '',
			getParamsList_pagination = el.data('pagination-get-params-list') || el.data('get-params-list') || '',
			liveReload_pagination = el.data('pagination-live-reload') || el.data('live-reload') || 'false',
			timeReload_pagination = el.data('pagination-time-reload') || el.data('time-reload') || 60000,
			cache_pagination = el.data('pagination-cache') || el.data('cache') || 'false',
			rel_pagination = el.data('pagination-rel') || el.data('rel') || '',
			dynamicField_pagination = el.data('get-default-value') || '';
		var paramsPagination = { service: service_data_pagination, method_pagination: method, template: template_pagination, target: target_pagination, page: initial_page_pagination, pagination_target: pagination_target_pagination, items_per_page: items_per_page_pagination, callback: callback_pagination, content: content_pagination, enableGetParams: enableGetParams_pagination, getParamsList: getParamsList_pagination, rel: rel_pagination, cache: cache_pagination };
		params['pagination'] = paramsPagination;
	}		

	getData(params);

	clearInterval(live);

	if (liveReload == 'true') {
		live = setInterval(getData(params), timeReload);
	}
}

function generatePagination(data, el, totalItems) {

	var data = data,
		pagination_target = el.pagination_target,
		target = el.target,
		items_per_page = getParams['filter[limit]'] || el.items_per_page;

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

		if (filter[0].indexOf("filter[skip]") < 0 && filter[0] != '') {
			href += '&' + filtersSearch[i];
		}
		else if (filter[0] != '') {
			currentPage = (filter[1] / items_per_page) + 1;
		}
	}

	if ($(pagination_target + ' .bootpag').length <= 0) {

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
				tabsPagination(event);
				window.location.href = '?filter[skip]=' + parseInt((num - 1) * items_per_page) + href;

			});
		}
	}
}

function filters(el) {
	var rels = el.data('rel') ? el.data('rel').split(',') : [];

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
}

function error(statusCode, code, message, dataMessage) {

	message = message === undefined ? '' : message;
	var title = '',
		content = message,
		HTML = false;

	switch (statusCode) {

		case 200:
			content = '200: ${{ default.operationOK }}$';
			break;

		case 201:
			content = '201: ${{ default.operationOK }}$';
			break;

		case 204:
			title="${{ default.errorLoginTitle }}$";
			content = '204: ${{ default.errorLoginContent }}$';
			break;

		case 400:
			content = '400:' + message;
			break;

		case 401:
			title="${{ default.errorAuthenticationTitle }}$";
			content = '401: ${{ default.errorAuthenticationContent }}$';
			break;

		case 403:
			content = '403';
			title="${{ default.errorRoleTitle }}$";
			content = '401: ${{ default.errorRoleContent }}$';
			break;

		case 404:
			content = '404:' + message;
			break;

		case 405:
			content = '405:' + message;
			break;

		case 406:
			content = '406:' + message;
			break;	

		case 409:
			content = '409:' + message;
			break;

		case 415:
			content = '415:' + message;
			break;	
					
		case 500:
			content = '500:' + message;
			break;

		default:
			content = statusCode + ':${{ default.unknownError }}$ .'+ message;
	}

	switch (code) {
		//Extend to custom errors
	}

	if(HTML){
		showHTMLError(title, content);
	}
	else{
		showError(title, content);
	}
}

// FUNCION QUE MUESTRA LA CAPA DE LOADING
function showLoading(){
	$('#loading-mask').addClass('active');
}

// FUNCION QUE OCULTA LA CAPA DE LOADING
function hideLoading(){
	$('#loading-mask').removeClass('active');
}

// FUNCION GENERICA DE ERROR
function showError(title,content){
	var modal = $('#modal-error');
	modal.find('h2').text(title);
	modal.find('p').text(content);
	modal.find('.customContent').html('');
	modal.modal('show');
}

// FUNCION GENERICA DE ERROR
function showHTMLError(title,content){
	var modal = $('#modal-error');
	modal.find('h2').text(title);
	modal.find('p').text('');
	if(content !=''){
		modal.find('.customContent').html(content);
	}
	modal.modal('show');
}

function filterContentByRol(){
	$('[data-auth-rol]').each(function(){
		if($(this).data('auth-rol') < $.cookie('id_rol')){
			$(this).remove();
		}
	});

	$('[data-auth-rol-eq]').each(function(){
		if($(this).data('auth-rol-eq') != $.cookie('id_rol')){
			$(this).remove();
		}
	});
}

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

function setDefaultGetParams(fieldName) {
	var params = JSON.parse(JSON.stringify(getParams));
	for (i = 0; i < Object.keys(params).length; i++) {
		if (Object.keys(params)[i] != "filter[skip]" && Object.keys(params)[i] != "filter[limit]") {
			var value = Object.values(params)[i];
			var key = Object.keys(params)[i];
			if (value.includes("[like]=")) {
				value = value.split("[like]=")[1];
				key += '%5Blike%3D%5D';
			}
			if (key == fieldName) {
				$('[name="' + key + '"]').val(value);
			}
		}
	}
}