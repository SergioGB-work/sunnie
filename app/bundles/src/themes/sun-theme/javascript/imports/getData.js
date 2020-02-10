// LISTADOS DE DATOS
	// Devuelve el listado comppleto de datos obtenidos de un servicio
	// @param service -> servicio rest del que se obtendrán los datos a mostrar
	// @param template -> selector CSS de la Template JSRender sobre la que se cargarán los datos devueltos
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
		callfront = el.callfront,
		privateRequest = el.private || 'false';

		
	if(callfront != '' && callfront !== undefined){
		eval(callfront + '()');
	}

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

							translateFilters = loopbackConnector(key,val,params,count);

							filter += translateFilters.filter;
							count = translateFilters.count;
						}
					});
				}
			});
		}
	}

	filter += loopbackPaginationConnector(filter,page,items_per_page);

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
	url = url.replace("{idSite}" , $("body").data("site-id"));
	url = url.replace("{idLayout}" , $(".layout").data("layout-id"));


	if (cache != true || cache == undefined || sessionStorage.getItem(url + '_${{ default.lang }}$') == '' || sessionStorage.getItem(url  + '_${{ default.lang }}$') == null) {

		var jsonData = aditionalData instanceof FormData ? aditionalData : JSON.stringify(aditionalData);
		var contentType = aditionalData instanceof FormData ? false : "application/json";
		var timeout = 600000; // tiempo de espera por defecto de la peticion

		var ajaxParamsPrivate = {
			url: url,
			type: method,
			data: jsonData,
			crossDomain: true,
			processData: false,
			contentType: contentType,
			cache: false,
			timeout: timeout,
			headers: {	
				"Authorization": access_token,
				"Accept-Language": '${{ default.lang }}$'
			}
		};

		var ajaxParamsPublic = {
			url: url,
			type: method,
			data: jsonData,
			crossDomain: true,
			processData: false,
			contentType: contentType,
			cache: false,
			timeout: timeout
		};

		var ajaxParams = {}

		if(jsonData instanceof FormData){
			jsonData = JSON.stringify(jsonData);
		}

		if(privateRequest == 'false'){
			ajaxParams = Object.assign(ajaxParamsPublic,{
				success: function (data, textStatus, xhr){
						console.log(url);
						console.log(jsonData);
						console.log("content:");				
						console.log(content);
						console.log("response:");
						console.log(data);
						console.log("--------------------------------------");
						ajaxSuccess(data, textStatus, xhr, cache, target, template, callback, content, el, jsonData);
					},
					error: function(data){
						console.log(url);
						console.log(jsonData);
						console.log("content:");				
						console.log(content);
						console.log("response:");
						console.log(data);
						console.log("--------------------------------------");					
						ajaxError(data)
					}
				});
		}
		else{
			ajaxParams = Object.assign(ajaxParamsPrivate,{
				success: function (data, textStatus, xhr){
						console.log(url);
						console.log(jsonData);
						console.log("content:");				
						console.log(content);
						console.log("response:");
						console.log(data);
						console.log("--------------------------------------");
						ajaxSuccess(data, textStatus, xhr, cache, target, template, callback, content, el, jsonData);
					},
					error: function(data){
						console.log(url);
						console.log(jsonData);
						console.log("content:");				
						console.log(content);
						console.log("response:");
						console.log(data);
						console.log("--------------------------------------");					
						ajaxError(data)
					}
				});
		}	
		
		
		var getURL = $.ajax(ajaxParams);
	}	
	else {
		processData(JSON.parse(sessionStorage.getItem(url + '_${{ default.lang }}$')), target, template, callback, content, '', {})
	}
}
