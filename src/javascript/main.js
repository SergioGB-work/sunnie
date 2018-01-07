var api = "http://smartretail-api.ttcloud.net:3000/api";
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

	$('form').submit(function(e){
		e.preventDefault();
		var url,method;
		var data = {};
		var form = $(this);


		form.find('input:not([type="radio"]):not([type="file"]):not([name$="-fileHidden"]),select,textarea,input[type="radio"]:checked').each(function(){

			var value = $(this).val();
			var name = $(this).attr('name');

			data[name] = value;

		});

		form.find('input[name$="-fileHidden"]').each(function(){
			var value = $(this).val();
			var name = $(this).attr('name').split('-');

			data[name[0]] = value;
		})	

		if($.cookie('id_session')!=''){
			data['idSession'] = $.cookie('id_session');
		}

		url = form.attr('data-action') + '?access_token=' + data['idSession'];
		method = form.data('method');
		data = {'data':data};

		url = url.replace('{id_tienda}',$.cookie('id_tienda')).replace('{id_cliente}',$.cookie('id_client'));
		console.log(url);
		$.ajax({
			url: url,
			type: method,
			dataType: 'json',
			data: data,		
			complete:function(data){
				
				var callback = form.data('callback') + '('+ JSON.stringify(data.responseJSON) +')';
				var f = eval(callback);
	        }
		});

	});

	//VALIDACION DE FORMILARIO PREVIO ENVIO
	//Aquellos formularios que requieran de validación deberan disponer de un button[type="submit"] y declarar un atributo data-toggle="validator" en su etiqueta <form>
	
	//@param data-toggle="validator" -> si de define en un etiqueta <form> hace que el formulario se valide automáticamente
	
	$('button[type="submit"]').click(function(e){

		if($(this).closest('form[data-toggle="validator"]').length > 0){
			
			e.preventDefault();
			var form = $(this).closest('form');

			if (!form.data("bs.validator").validate().hasErrors()) {
			        form.submit();
			        showLoading();
			}		
		}
		else{
			var form = $(this).closest('form');
			form.submit();
		}

	});


	// GENERALIZACION DE PAGINACION
	// Se puede establacer una paginación automática para aquellos listados de datos que haya definido un data-has-pagination="true"
	// @param data-has-pagination -> Indica que el elemento tiene paginación 

	$('[data-has-pagination="true"]').each(function(e){
		
		pagination($(this));

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

	// PIE PROGRESS
	$('[data-pieprogress="true"]').each(function(e){
		pieProgress($(this));
	});	
	// LOGOUT DE LA PLATAFORMA
	$('.logout').click(function(){

		$.ajax({
			url: api + '/usuarios/logout',
			type: 'post',
			dataType: 'json',
			data: {idSession: $.cookie('id_session')},
			complete:function(data){	
				$.removeCookie('id_session');
				$.removeCookie('username');
				$.removeCookie('id_rol');
				$.removeCookie('id_client');
				window.location.href="./";
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

	//PROCESA LOS FICHEROS DE LOS FORMULARIOS
	if($('input[type="file"]').length > 0){

		var elems = document.querySelectorAll('input[type="file"]');

		for(var i=0;i<elems.length;i++){
		    elems[i].onchange = function(){encodeImageFileAsURL(this,$(this).data('file-view'))};
		}
	}


	//FILTROS DE LISTADOS
	if($('[data="filters"]').length){

		$('[data="filters"] [data-filter]').each(function(){

			var filterParent = $(this);
			var dataFilter = $(this).data('filter');
			var search = window.location.search.replace('?','');

			filtersSearch = search.split('&');

			$(this).find('[data-filter-value]').each(function(){
				
				var finalHref = '';

				if($(this).data('filter-value').toString() != ''){
					finalHref = dataFilter + '=' + $(this).data('filter-value');
				}
				
				for(var i=0;i<filtersSearch.length;i++){

					filter = filtersSearch[i].split('=');

					if($(this).data('filter-value').toString() != ''){
						if(finalHref.indexOf(filter[0] + '=') < 0){

							if(finalHref != ''){
								finalHref += '&';
							}

							finalHref += filtersSearch[i];
						}
					}
					
					else if(filter[0] != dataFilter){
							if(finalHref != ''){
								finalHref += '&';
							}

							finalHref += filtersSearch[i];
					}

					//Comprueba el valor actual del filtro en la URL y lo pone en el filtro
					if(filter[0] == dataFilter){
						var dataFilterValue = filterParent.find('[data-filter-value="'+ filter[1] +'"]');
						dataFilterValue.parent().addClass('active');
						filterParent.find('.filterValue').text(dataFilterValue.text());
					}
				}

				$(this).attr('href','?' + finalHref);

			});
		});
	}
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


function getData(service,method,template,target,page,items_per_page,aditionalData,callback,content){
	var filter = '';

	if (page !== undefined && page != '' && page > 0) {
		page = ((page - 1)*items_per_page);
		filter += '&filter[skip]=' + page;
	}

	if (items_per_page !== undefined && items_per_page != '' && items_per_page > 0) {
		filter += '&filter[limit]=' + items_per_page;
	}

	if(Object.keys(getParams).length > 0){
		var count = 0;
		$.each(Object.keys(getParams), function(i, val) {
			
			if(val=='order'){
				filter += '&filter['+val+']=' + getParams[val];
			}

			else if(val=='query'){
				var n=0;
				$.each(Object.keys(getParams), function(index, value) {
					if(value.indexOf('searchField') > -1){	
						filter += '&filter[where][and]['+count+'][or]['+n+']['+getParams[value]+'][like]=%' + getParams[val]+'%';
						n++;;
					}	
				})
				count++;


			}

			else if(val.indexOf('searchField') < 0 && val != '' && val.indexOf('action') < 0){
				filter += '&filter[where][and]['+count+']['+val+']=' + getParams[val];
				count++;
			}
		});
	}

	console.log(service +"?access_token=" + $.cookie('id_session') + filter);

	$.ajax({
		url: service +"?access_token=" + $.cookie('id_session') + filter,
		type: method,
		data: aditionalData,
		dataType: 'json',
		complete:function(data){
			dataResponse = data.responseJSON;
			data = {"data":dataResponse};

			console.log(JSON.stringify(data));

			if((target != '') && (template != '')){
				$(target).html('');
				$(template).tmpl(data).appendTo(target);
			}	
			if((callback != '') && (callback !== undefined)){

				var exec = callback + '('+ JSON.stringify(dataResponse) +')';

				if(content != ''){
					exec = callback + '('+ JSON.stringify(dataResponse) +',"' + content +'")';
				}
				
				var f = eval(exec);				
			}
        }
	});	
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



	var service = el.data('service-data') || '',
		items_per_page = el.data('items-per-page'),
		initial_page = el.data('initial-page'),
		callback = el.data('callback') || '',
		method = el.data('method') || 'GET',
		content = el.data('content') || '',
		template = el.data('template') || '',
		target = el.data('target') || '',
		aditionalData = el.data('aditional-data');

		getData(service,method,template,target,initial_page,items_per_page,aditionalData,callback,content);
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

function pagination(el){
	var el = el;
	var service_data_all = el.data('pagination-service-data-all') || el.data('service-data') || '',
		items_per_page = el.data('pagination-items-per-page') || el.data('items-per-page'),
		initial_page = el.data('pagination-initial-page') || el.data('initial-page'),
		pagination_target = el.data('pagination-container-target') || '.pagination',
		service_data = el.data('pagination-service-data') || el.data('service-data') || '',
		method = el.data('pagination-method') || el.data('method') || '',
		content = el.data('pagination-content') || el.data('content') || '',
		template = el.data('pagination-template') || el.data('template') || '',
		target = el.data('pagination-target') || el.data('target') || '',
		callback = el.data('pagination-callback') || el.data('callback') || '',
		aditionalData = el.data('pagination-aditional-data') || el.data('aditional-data') || '';

    getData(service_data_all,method,'','',0,0,aditionalData,'generatePagination',service_data + '","' + method + '","' + template + '","' + target + '","' + initial_page + '","' + pagination_target + '","' + items_per_page + '","' + callback + '","' + content);
}

function generatePagination(data,service_data,method,template,target,initial_page,pagination_target,items_per_page,callback,content){
	
	var totalPages = data.length / items_per_page;

	if(totalPages % 1 != 0){
		totalPages = parseInt(totalPages) + 1;
	}

	if($(pagination_target + ' .bootpag').length <= 0){

		$(pagination_target).parents('.fragment-pagination').find('.totalResults').text(data.length);
		$(pagination_target).parents('.fragment-pagination').find('.initInterval').text((initial_page - 1)*items_per_page + 1);
		$(pagination_target).parents('.fragment-pagination').find('.lastInterval').text(parseInt((initial_page - 1)*items_per_page) + parseInt(items_per_page));

		$(pagination_target).bootpag({
		   total: totalPages,
		   page: initial_page,
		   maxVisible: 5
		}).on('page', function(event, num){
			showLoading()
			$(pagination_target).parents('.fragment-pagination').find('.totalResults').text(data.length);
			$(pagination_target).parents('.fragment-pagination').find('.initInterval').text((num - 1)*items_per_page + 1);
			$(pagination_target).parents('.fragment-pagination').find('.lastInterval').text(parseInt((num - 1)*items_per_page) + parseInt(items_per_page));
				
			getData(service_data,method,template,target,num,items_per_page,'',callback,content)

		});
	}	
}

function error(code,content){
	var title='',
		content='';
	
	switch(code){

		case 200:
			content = '200: ${{ default.operationOK }}$';
			break;

		case 201:
			content = '201';
			break;

		case 204:
			title="${{ default.errorLoginTitle }}$";
			content = '204: ${{ default.errorLoginContent }}$';
			break;

		case 400:
			content = '400';
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
			content = '404';
			break;

		case 405:
			content = '405';
			break;

		case 406:
			content = '406';
			break;	

		case 409:
			content = '409';
			break;

		case 415:
			content = '415';
			break;	
					
		case 500:
			content = '500';
			break;

		case 'USER_ERR_NOT_FOUND':
			break;

		case 'USER_ERR_TOKEN_OUTDATED':
			break;

		case 'USER_ERR_LOGIN':
			title="${{ default.errorLoginTitle }}$";
			content = '${{ default.errorLoginContent }}$';
			break;	

		default:
			content = '${{ default.unknownError }}$ '+code;								
	}

	showError(title,content);
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

// Codificacion a Base64 de input file
// Codifica el fichero en Base64 y lo guarda en un input hidden a continuacion del input file correspondiente.
function encodeImageFileAsURL(element,target_view) {

	var file = element.files[0];
	var reader = new FileReader();

	var name = $(element).attr('name');
	var id = $(element).attr('id');

	reader.onloadend = function() {

		var form = $(element).closest('form');
		if(form.find('input[name="'+name+'-fileHidden"]').length > 0){
			form.find('input[name="'+name+'-fileHidden"]').attr('value',reader.result);
		}
		else{
			$('<input type="hidden" value="'+reader.result+'" name="'+name+'-fileHidden" />').insertAfter($(element));
		}

		$(target_view).attr("src",reader.result).removeClass('hidden');

	}
	reader.readAsDataURL(file);
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


function pieProgress(el){
	var pie = el;
	var goal = pie.data('goal') || 100;
	var size = pie.data('size') || 100;
	var barsize = pie.data('barsize') || 4;
	var min = pie.data('min') || 0
	var max = pie.data('max') || 100;
	var easing = pie.data('easing') || 'ease';
	var trackcolor = pie.data('trackcolor') || '#f2f2f2';
	

	pie.asPieProgress({
		namespace: 'pie_progress',
		goal: goal,
		size: size,
		barsize: barsize,
		min: min,
		max: max,
		easing: easing,
		trackcolor: trackcolor
	});

	pie.asPieProgress('start');
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

function markRol(el,rol){
	var rol = rol;
	var el = el;
	el.find('[id^="rol_'+rol+'"]').attr( "checked", true );
}

function markClient(el,client){
	var rol = rol;
	var el = el;
	el.find('.select_id_cliente').val(client);
}