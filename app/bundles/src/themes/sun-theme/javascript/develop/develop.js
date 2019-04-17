var apiDevelop = "http://localhost:8082";

$(document).ready(function(){
	$('#confirmDeleteComponent').on('show.bs.modal',function(event){
		var component = $(event.relatedTarget).closest('.component'),
			position = component.data('layout-position'),
			layoutColumn = component.closest('[data-layout-column]').data('layout-column'),
			idPage = component.closest('[data-page-id]').data('page-id');

		$(this).find('[name="componentPosition"]').val(position);	
		$(this).find('[name="layoutColumn"]').val(layoutColumn);	
		$(this).find('form').data('content','"'+component.attr('id')+'"');
	})

	$('#modal-page-add .send').click(function(){
		$(this).closest('#modal-page-add').modal('hide');
		showError('','Creando página, espere por favor...');
	});

	$('#modal-page-edit .send').click(function(){
		$(this).closest('#modal-page-edit').modal('hide');
		showError('','Editando y desplegando página, espere por favor...');
	});

	$('#modal-page-edit').on('show.bs.modal',function(event){
		dataList($('#edit-page-block'));
	});

	$('#modal-page-delete .send').click(function(event){
		$(this).closest('#modal-page-delete').modal('hide');
		showError('','Eliminando página, espere por favor...');
	});

	$('#modal-component-add .send').click(function(){
		$(this).closest('#modal-component-add').modal('hide');
		showError('','Añadiendo componente, espere por favor...');
	});

	$('#modal-component-add #componentName').change(function(){
		var component = $(this).val();

		getData({
			"service": apiDevelop + "/component/config/" + component,
			"method": "GET", "template": "#templateDynamicConfigComponent",
			"target": "#dynamicConfig"
		});

	});

	$('#modal-component-edit .send').click(function(){
		$(this).closest('#modal-component-edit').modal('hide');
		showError('','Aplicando cambios del componente, espere por favor...');
	});	

	$('#modal-component-edit').on('show.bs.modal',function(event){

		var position = $(event.relatedTarget).closest('[data-layout-position]').data('layout-position');
		var column = $(event.relatedTarget).closest('[data-layout-column]').data('layout-column');

		getData({
			"service": apiDevelop + "/site/{idSite}/page/{idPage}/component/detail",
			"method": "POST", "template": "#templateEditComponent",
			"target": "#edit-component-block", "callback": "dataComponentLoadedCallback",
			"aditionalData":{"componentPosition":position,"layoutColumn":column}
		});
	});	

	$('#modal-component-delete .send').click(function(){
		$(this).closest('#modal-component-delete').modal('hide');
		showError('','Eliminando componente, espere por favor...');
	});	

	$('#modal-component-delete').on('show.bs.modal',function(event){
		var position = $(event.relatedTarget).closest('[data-layout-position]').data('layout-position');
		var column = $(event.relatedTarget).closest('[data-layout-column]').data('layout-column');

		$(this).find('[name="layoutColumn"]').val(column);
		$(this).find('[name="componentPosition"]').val(position);

	});
	
	$(document).on('click','[data-block-type="array"] [data-array-id] .addItem',function(){
		var array_item = $(this).closest('[data-array-id]').clone();

		array_item.insertBefore($(this).closest('[data-array-id]'));
		$(this).closest('[data-array-id]').find('input').val('');

		reloadArrayIndex($(this).closest('[data-block-type="array"]'));
	});

	$(document).on('click','[data-block-type="array"] [data-array-id] .deleteItem',function(){
		var dataArray = $(this).closest('[data-block-type="array"]')
		
		if(dataArray.find('[data-array-id]').length > 1){
			$(this).closest('[data-array-id]').remove();
			reloadArrayIndex(dataArray);
		}

	});

	$('#modal-menu-tools .card').click(function(){
		$(this).closest('.modal').modal('hide');
	});

	$('#modal-site-confirm-publish .send').click(function(){
		$(this).closest('.modal').modal('hide');
		showError('','Publicando site, espere por favor...');
	});

	$('#modal-site-add .send').click(function(){
		showError('','Creando site, espere por favor...');
	});

	$('#modal-site-edit .send').click(function(){
		showError('','Editando site, espere por favor...');
	});	

	$('#modal-site-edit').on('show.bs.modal',function(event){
		dataList($('#edit-site-block'));
	});

	$('#modal-site-delete .send').click(function(event){
		$(this).closest('.modal').modal('hide');
		showError('','Site Eliminado');
	});

});

function reloadArrayIndex(el){
	el.find('[data-array-id]').each(function(index,el){
		$(this).attr('data-array-id',index);
	});
}

function callbackDeleteComponent(data,component){
	$('#confirmDeleteComponent').modal('hide');
	$('#' + component).remove();
}

function addPageCallback(data){
	var modal = $('#modal-page-add');
	modal.find('form')[0].reset();
	dataList($('#navigation-list ul'));
	$('#modal-error').modal('hide');
}

function editPageCallback(data){
	var modal = $('#modal-page-edit');
	modal.find('form')[0].reset();
	dataList($('#navigation-list ul'));
	$('#modal-error').modal('hide');
}

function deletePageCallback(data){
	dataList($('#navigation-list ul'));
	$('#modal-error').modal('hide');
	$('[data-layout-column="'+data.column+'"] [data-layout-position="'+data.position+'"]').remove();
}

function dataEditPageLoadedCallback(data){
	dataList($('#modal-page-edit #layoutEditList'));
}

function dataEditSiteLoadedCallback(data){
	dataList($('#modal-site-edit #themeList'));
}

function addComponentCallback(data){
	var modal = $('#modal-component-add');
	modal.find('form')[0].reset();
	$('#modal-error').modal('hide');
	location.reload();
}

function checkLayoutSelected(data,idLayout){
	$('#modal-page-edit #layoutEditList input[value="'+idLayout+'"]').attr('checked','checked');
}

function checkThemeSelected(data,idTheme){
	$('#modal-site-edit #themeList input[value="'+idTheme+'"]').attr('checked','checked');
}

function dataComponentLoadedCallback(data){
	dataList($('#modal-component-edit #componentName'));
	dataList($('#modal-component-edit #layoutColumn'));
}

function checkComponentEdited(data, nameComponent){
	$('#modal-component-edit #componentName option[value="'+nameComponent+'"]').attr('selected','selected');
}

function checkLayoutColumn(data, column){
	$('#modal-component-edit #layoutColumn option[value="'+column+'"]').attr('selected','selected');
}

function editComponentCallback(data){
	$('#modal-error').modal('hide');
	location.reload();
}

function publishSiteCallback(){
	$('#modal-error').modal('hide');
}

function addSiteCallback(data){
	$('#modal-error').modal('hide');
}

function editSiteCallback(data){
	$('#modal-error').modal('hide');
	
	if(data.oldUrl == '/'){
		location.href = data.url + location.pathname
	}
	else{
		var newLocation = location.pathname.split(data.oldUrl);
		newLocation.shift();
		location.href = newLocation.join('');
	}
}