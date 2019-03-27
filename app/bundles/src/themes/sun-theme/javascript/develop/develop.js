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

	$('#modal-component-edit .send').click(function(){
		$(this).closest('#modal-component-edit').modal('hide');
		showError('','Aplicando cambios del componente, espere por favor...');
	});	

	$('#modal-component-edit').on('show.bs.modal',function(event){

		var position = $(event.relatedTarget).closest('[data-layout-position]').data('layout-position');
		var column = $(event.relatedTarget).closest('[data-layout-column]').data('layout-column');

		getData({
			"service": apiDevelop + "/page/{idPage}/component/detail",
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

});

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

function addComponentCallback(data){
	var modal = $('#modal-component-add');
	modal.find('form')[0].reset();
	$('#modal-error').modal('hide');
	location.reload();
}

function checkLayoutSelected(data,idLayout){
	$('#modal-page-edit #layoutEditList input[value="'+idLayout+'"]').attr('checked','checked');
}

function dataComponentLoadedCallback(data){
	dataList($('#modal-component-edit #componentName'));
}

function checkComponentEdited(data, nameComponent){
	$('#modal-component-edit #componentName option[value="'+nameComponent+'"]').attr('selected','selected');
}

function editComponentCallback(data){
	$('#modal-error').modal('hide');
	location.reload();
}