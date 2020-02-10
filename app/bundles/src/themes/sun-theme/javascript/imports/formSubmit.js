	// GENERALIZACION DE FORMULARIOS
	// Cuando un formulario es enviado, recoge todos los datos y los envía al servicio seleccionado
	// Los name de los inputs deben llamarse igual que los campos en BD
	
	// @param data-action -> Servicio al que se enviarán los datos del formulario
	// @param data-method -> Método de envío del formulario (GET/POST)
	// @param data-callback -> Nombre de la función que se ejecutará al invocarse el evento complete de Ajax. El data devuelvo se le envía a la función como parametro


function formSubmit(){	
	$(document).on('submit','form',function (e) {
		e.preventDefault();
		var url, method;
		var data = {};
		var form = $(this);
		var noReload = form.data('noreload') || '';
		var enableModalUploadProgress = form.data('enable-modal-upload-progress');

		var rel = $(this).data('rel') || '';

		if (rel != '' && rel !== undefined) {
			rel = rel.split(',');

			$.each(rel, function (index, elem) {
				rel[index] = '_' + rel[index];
			});
		}


		var emptyVars = '';
		var arraysArrays = [];
		var newGroup = [];

		form.find('input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):not([name$="-fileHidden"]):not([type="submit"]),select,textarea,input[type="radio"]:checked,input[type="checkbox"]:checked').each(function () {

			var value = $(this).val();
			var name = $(this).attr('name');
			var group = $(this).parents('[data-form-group]:last');
		    
			//Solo se procesa si es un input hijo directo del form o si es un group hijo directo del form.
			if(group.length >= 1){

				if(!newGroup.includes(group.data('form-group'))){
					data = Object.assign(data, buildSitemapForm(group));
					newGroup.push(group.data('form-group'));
				}

			}
			else if(group.length <= 0 && value != ''){
				if (rel != '') {
					$.each(rel, function (index, elem) {
						{
							data[name + elem] = value;
						}
					})
				}	
				else{
					data[name] = value;
				}
			}

			if (form.data('form-filter') == true && value == '') {
				if (rel != '') {
					$.each(rel, function (index, elem) {

						emptyVars += name + elem + '&';

					})
				}
				else {

					emptyVars += name + '&';
				}
			}

		});

		var filesInput = form.find('input[type="file"]');

		if(filesInput.length > 0){
			var dataFormData = new FormData();	

			form.find('input[type="file"]').each(function(){

				if($(this).get(0).files.length > 1){
					
					var filesArray = [];

					for(var i=0;i < $(this).get(0).files.length; i++){

						filesArray.push($(this).get(0).files[i]);
					}

					dataFormData.append($(this).attr('name'),filesArray) ;
				}
				else{
					dataFormData.append($(this).attr('name'), $(this).get(0).files[0]);
				}
				
			});



			for ( var key in data ) {
    			dataFormData.append(key, data[key]);
			}

			data = dataFormData;

	        if(enableModalUploadProgress == true){
	        	//Cerramos la modal si el formulario esta en una modal
	        	form.closest('.modal').modal('hide');
	        	//Mostramos la modal de progreso de subida de ficheros
				$('#modal-multimedia-uploadingFiles').modal('show').find('.alerts-block').html('');

		        itemsUploaded = 0;

		        form.find('input[type="file"]').each(function(){
		        	itemsUploaded += uploadFilesArray[$(this).attr('name')].length
		        });


		        $('.progressBar-block .current').text('0');
		        $('.progressBar-block .total').text(itemsUploaded);
		        $('.progressBar-block .percentage').text('0%');
		        $('.progressBar-block .progress-bar').css('width', '0%');

		        form.find('input[type="file"]').each(function(){
			        
			        for (var key in uploadFilesArray[$(this).attr('name')]) {

			            dataFormData = new FormData();
			            dataFormData.append($(this).attr('name'), uploadFilesArray[$(this).attr('name')][key]);
			            var params = { "service": form.attr('data-action'), "method": form.data('method'), "aditionalData": dataFormData, "callback": form.data('callback')};
			            getData(params);
			        }
			        uploadFilesArray[$(this).attr('name')] = [];
			    });
	        }

		}

		if (form.data('form-filter') != true && enableModalUploadProgress !== true) {
			url = form.attr('data-action');
			method = form.data('method');			
			var params = { "service": url, "method": method, "aditionalData": data, "callback": form.data('callback'), "content":form.data('content'),"callfront":form.data('callfront'), "private": form.data('private')};
			getData(params);
		}
		else if(form.data('form-filter') == true) {

			var filters = JSON.stringify(data);

			filters = filters.replace(/:/g, '=').replace(/"/g, '').replace(/,/g, '&').replace('{', '').replace('}', '').replace(/%5Blike%3D%5D=/g, '=[like]%3D');
			var search = window.location.search.replace('?', '');
			filtersSearch = search.split('&');
			for (var i = 0; i < filtersSearch.length; i++) {
				filter = filtersSearch[i].split('=');
				if (filters.indexOf(filter[0] + '=') < 0 && emptyVars.indexOf(filter[0]) < 0 && filter[0] != 'filter[skip]' && (form.find('input[name = "'+filter[0]+'"]:checkbox').not(':checked').length <= 0)) {
					filters += '&' + filter[0] + '=' + filter[1]
				}
			}
			
			filters = (filters[0] == '&') ? filters.substr(1) : filters;

			if(noReload != true){
				url = form.attr('data-action') + '?' + filters;
				window.location.href = url;				
			}
			else{
				window.history.pushState('','','?' + filters);
				reloadComponents();
			}
		}
	});
}