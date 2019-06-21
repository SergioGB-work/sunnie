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
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-page-add').modal('hide');
			showError('','Creando página, espere por favor...');
		}
	});

	$('#modal-page-edit .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-page-edit').modal('hide');
			showError('','Editando y desplegando página, espere por favor...');
		}
	});

	$('#modal-page-edit').on('show.bs.modal',function(event){
		dataList($('#edit-page-block'));
	});

	$('#modal-page-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-page-delete').modal('hide');
			showError('','Eliminando página, espere por favor...');
		}
	});

	$('#modal-component-edit .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-component-edit').modal('hide');
			showError('','Aplicando cambios del componente, espere por favor...');
		}	
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
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-component-delete').modal('hide');
			showError('','Eliminando componente, espere por favor...');
		}	
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
		$($(this).data('target')).modal('show');

		$($(this).data('target')).on('shown.bs.modal',function(event){
			$('body').addClass('modal-open');
		});	
	});

	$('#modal-site-confirm-publish .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Publicando site, espere por favor...');
		}	
	});

	$('#modal-site-add .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Creando site, espere por favor...');
		}	
	});

	$('#modal-site-edit .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Editando site, espere por favor...');
		}	
	});	

	$('#modal-site-edit').on('show.bs.modal',function(event){
		dataList($('#edit-site-block'));
	});

	$('#modal-site-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Site Eliminado');
		}
	});

	$('.sunniejs-addButton').click(function(){
		$('body').toggleClass('show-sidebar-menu-tools');
	})

	$('#ToolsComponentList').on('dragstart','[draggable="true"]', function(evt) {
		evt.originalEvent.dataTransfer.setData("id", $(this).data('id-component'));
		evt.originalEvent.dataTransfer.setData("origin", 'new');
		$('#templateLayoutDropZone').tmpl().appendTo($('.layout .layout-column'));
	});


	$('#ToolsComponentList').on('dragend','[draggable="true"]', function(evt) {
		$('.layout .layout-drop-zone').remove();
	});

	$('.layout .layout-column').on('dragstart','.component', function(evt) {
		evt.originalEvent.dataTransfer.setData("origin", 'move');
		evt.originalEvent.dataTransfer.setData("oldPosition", $(this).data("layout-position"));
		evt.originalEvent.dataTransfer.setData("oldLayoutColumn", $(this).closest('.layout-column').data("layout-column"));
	});

	$('.layout .layout-column').on('dragend','.component', function(evt) {
		$('.layout .layout-drop-zone').remove();
	});


	$('.layout .layout-column').on('dragover','.component', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$(this).addClass('dragging-over');
	});

	$('.layout .layout-column').on('dragleave','.component', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$(this).removeClass('dragging-over');
	});

	$('.layout .layout-column').on('drop','.component', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$(this).removeClass('dragging-over');
		
		var origin = evt.originalEvent.dataTransfer.getData("origin");
		var layoutColumn = $(this).closest('.layout-column').data("layout-column");
		var layoutPosition = $(this).data("layout-position");

		if(origin=='new'){
			var id = evt.originalEvent.dataTransfer.getData("id");
			$('#templateNewComponent').tmpl({data:id}).insertBefore($(this));
			refreshPositions(layoutColumn);
			refreshPositions(oldLayoutColumn);
			addComponentToPage({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"name":id})
		}
		else{
			var oldPosition = evt.originalEvent.dataTransfer.getData("oldPosition");
			var oldLayoutColumn = evt.originalEvent.dataTransfer.getData("oldLayoutColumn");
			var originalComponent = $('[data-layout-column='+oldLayoutColumn+'] [data-layout-position='+oldPosition+']');
			var componentToMove = originalComponent.clone(true);

			componentToMove.insertBefore($(this));
			originalComponent.remove();
			refreshPositions(layoutColumn);
			refreshPositions(oldLayoutColumn);
			moveComponent({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"oldPosition":oldPosition, "oldLayoutColumn":oldLayoutColumn})
		}

	});

	$('.layout .layout-column').on('dragover','.layout-drop-zone', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$(this).addClass('dragging-over');
	});

	$('.layout .layout-column').on('dragleave','.layout-drop-zone', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$(this).removeClass('dragging-over');
	});

	$('.layout .layout-column').on('drop','.layout-drop-zone', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

		var origin = evt.originalEvent.dataTransfer.getData("origin");
		var layoutColumn = $(this).closest('.layout-column').data("layout-column");
		var layoutPosition = $(this).closest('.layout-column').find('.component').length;


		if(origin=='new'){
			var id = evt.originalEvent.dataTransfer.getData("id");
			$('#templateNewComponent').tmpl({data:id}).insertBefore($(this));
			addComponentToPage({"layoutColumn":layoutColumn,"layoutColumnPosition":0,"name":id})
		}
		else{
			var oldPosition = evt.originalEvent.dataTransfer.getData("oldPosition");
			var oldLayoutColumn = evt.originalEvent.dataTransfer.getData("oldLayoutColumn");
			var originalComponent = $('[data-layout-column='+oldLayoutColumn+'] [data-layout-position='+oldPosition+']');
			var componentToMove = originalComponent.clone(true);

			componentToMove.appendTo($(this).closest('.layout-column'));
			originalComponent.remove();
			refreshPositions(layoutColumn);
			refreshPositions(oldLayoutColumn);
			moveComponent({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"oldPosition":oldPosition, "oldLayoutColumn":oldLayoutColumn})
		}




	});	

});

function refreshPositions(column){

	$('[data-layout-column='+column+'] .component').each(function(index,value){

		$(this).attr('data-layout-position',index)

	})

}

function addComponentToPage(el){

	var layoutColumn = el.layoutColumn || '';
	var position = el.layoutColumnPosition || 0;
	var name = el.name || '';

	getData({
		"service": apiDevelop + "/site/{idSite}/page/{idPage}/component/add",
		"method": "POST",
		"aditionalData":{"layoutColumn":layoutColumn,"layoutColumnPosition":position,"name":name,"newComponent":"true"}
	});	
}

function moveComponent(el){

	var layoutColumn = el.layoutColumn || '';
	var position = el.layoutColumnPosition || 0;
	var oldPosition = parseInt(el.oldPosition);
	var oldLayoutColumn = el.oldLayoutColumn;
	console.log("OldPos:" + oldPosition);
	console.log("OldColumn:" + oldLayoutColumn);
	console.log("position:" + position);
	console.log("layoutColumn:" + layoutColumn);
	
	getData({
		"service": apiDevelop + "/site/{idSite}/page/{idPage}/component/move",
		"method": "POST",
		"aditionalData":{"layoutColumn":layoutColumn,"layoutColumnPosition":position,"oldPosition":oldPosition,"oldLayoutColumn":oldLayoutColumn}
	});
}

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
	location.reload();
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
	loadConfigComponent();
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

function loadConfigComponent(){

	if($('#componentName').val() == 'component-form-filter'){

		//APLICABLE SOLO AL FORM FILTER
		$('#form-edit-component [name="type"]').change(function(){

			if($(this).val() == 'select'){
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().addClass('d-none');
			}

		})

		$('#form-edit-component [name="type"]').each(function(){
			if($(this).val() == 'select'){
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().addClass('d-none');
			}
		});


		//APLICABLE SOLO AL FORM FILTER
		$('#form-edit-component [name="formFilter"]').change(function(){

			if($(this).val() == 'false'){
				$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"]').parent().addClass('d-none');
			}

		})


		if($('#form-edit-component [name="formFilter"]').val() == 'false'){
			$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"]').parent().removeClass('d-none');
		}
		else{
			$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"]').parent().addClass('d-none');
		}

	}
}
