function loadEvents(el){

	// GENERALIZACION DE LISTADOS DE DATOS
	// @param data-load -> Indica que el elemento se cargará con datos dinamicos 

	$(el).find('[data-load="true"]').each(function(e){
		filterContentByRol();
		dataList($(this));
	});	

	// GENERALIZACION DE BUSQUEDAS

	$(el).find('[data-search="true"]').each(function(e){
		dataSearch();
	});

	if ($(el).find('[data="filters"]').length > 0) {

		$(el).find('[data="filters"]').each(function () {
			filters($(this));
		});
	};


	$(el).find('[data-parent]').each(function(){
		dataParent($(this));
	});


	$(el).find('[data-event]').each(function(){
		dataEvent($(this));
	});

	$(el).find('[data-upload-file-preview="true"]').each(function(){
		dataUploadFilePreview($(this));
	});

	$(el).find('[data-toggle="tooltip"]').tooltip();
}