var apiDevelop = "http://localhost:8082";

$(document).ready(function(){

	// Cuando se abre una modal se  carga cualquier contenido dinamico que tenga por defecto. 
	// Los contenidos adicionales se deben cargar en el callback de la peticion
	$('.modal').on('show.bs.modal',function(event){
		if($(this).find('.cke').length > 0){	
			clearCKeditor();
		}
		if($(this).find('form').length > 0){
			$(this).find('form')[0].reset();
		}		
		
		$(this).find("[data-service-data]:not([data-load='false'])").each(function(){
			dataList($(this));
		})

  		$('[data-toggle="tooltip"]').tooltip()
		
	});

	//BUG - Cuando Cierras un modal y abres otro a la vez el scroll de la pantalla desaparece
	$('.modal').on('shown.bs.modal',function(event){
		$('body').addClass('modal-open');
		initSpecialTextareas($(this));
	});

	$('body').on('shown.bs.tab','[data-toggle="tab"]',function(event){
		initSpecialTextareas($($(this).attr('href')));	
	});	

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

	$('#modal-page-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-page-delete').modal('hide');
			showError('','Eliminando página, espere por favor...');
		}
	});

	$('#modal-page-confirm-publish .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Publicando página, espere por favor...');
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

	$('#modal-component-created-edit .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Modificando y desplegando componente, espere por favor...');
		}	
	});		

	$('#modal-component-created-edit').on('show.bs.modal',function(event){
		
		var componentName = $(event.relatedTarget).data('component-name');

		getData({
			"service": apiDevelop + "/site/{idSite}/component/detail-created/" + componentName,
			"method": "GET", "template": "#templateEditComponentCreated",
			"target": "#edit-component-created-block", "callback": "dataComponentEditLoadedCallback"
		});		

	});	


	$('#modal-component-created-delete').on('show.bs.modal',function(event){
		var componentName = $(event.relatedTarget).data('component-name');
		$(this).find('[name="name"]').val(componentName);
	});


	
	$(document).on('click','[data-block-type="array"] [data-array-id] .addItem',function(){
		var array_item = $(this).closest('[data-array-id]').clone(true);
		
		$(array_item).find('textarea').each(function(){
			var newID = 'input' + (Math.random() * (99999 - 0) + 0);//Se genera un nuevo ID para los CK Editor
			$(this).attr("id", newID );//Se asocia el id al textarea que será el ckeditor 
			$(this).prev().attr("for", newID );
		})
		
		$(array_item).find('.cke').remove();
		
		array_item.insertAfter($(this).closest('[data-array-id]'));
		
		$(this).closest('[data-array-id]').next().find('textarea.richHTML').each(function(){	
			CKEDITOR.replace($(this).attr('id'));
		});

		$(this).closest('[data-array-id]').next().find('[data-default-visibility="hidden"]').addClass('d-none');
		$(this).closest('[data-array-id]').next().find('input,textarea,select').val('');

		$(this).closest('[data-array-id]').next().find('[data-parent]').each(function(){
			dataParent($(this));
		});

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

	$('#modal-site-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Site Eliminado');
		}
	});

	$('#modal-locales .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('#modal-locales').modal('hide');
			showError('','Actualizando traducciones, espere por favor...');
		}
	});

	$('#modal-locales form').on('change','[name="key"]',function(e){
		var val = $(this).val();
		val = val.replace(/[^a-zA-Z0-9]/gi,'');

		$(this).val(val);
		$(this).closest('.locale-key').find('.locale-code').text('custom.' + val);
	});

	$('#modal-content-add .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Añadiendo contenido, espere por favor...');
		}	
	});

	$('#modal-content-edit').on('show.bs.modal',function(event){
		
		var idContent = $(event.relatedTarget).data('content-id');
		var contentType = $(event.relatedTarget).data('content-type');

		getData({
			"service": apiDevelop + "/site/{idSite}/content/detail/"+contentType+"/" + idContent,
			"method": "GET", "template": "#templateEditContent",
			"target": "#edit-content-block", "callback": "dataContentLoadedCallback"
		});		

	});

	$('#modal-content-edit .send').click(function(){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Desplegando contenido editado, espere por favor...');
		}
	});

	$('#modal-content-delete').on('show.bs.modal',function(event){
		var idContent = $(event.relatedTarget).data('content-id');
		var contentType = $(event.relatedTarget).data('content-type');
		$(this).find('[name=id]').val(idContent);
		$(this).find('[name=contentType]').val(contentType);
	});

	$('#modal-content-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Eliminando contenido, espere por favor...');
		}
	});	

	$('#modal-contentType-edit').on('show.bs.modal',function(event){
		
		var contentType = $(event.relatedTarget).data('content-type');

		getData({
			"service": apiDevelop + "/site/{idSite}/content/contentType/detail/" + contentType,
			"method": "GET", "template": "#templateEditContentType",
			"target": "#edit-contentType-block", "callback": "dataContentTypeLoadedCallback"
		});		

	});

	$('#modal-contentType-edit .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Editando tipo de contenido, espere por favor...');
		}
	});	

	$('#modal-contentType-delete').on('show.bs.modal',function(event){
		var contentType = $(event.relatedTarget).data('content-type');
		$(this).find('[name=contentTypeName]').val(contentType);
	});

	$('#modal-contentType-delete .send').click(function(event){
		if(validateForm($(this).closest('form'))){
			$(this).closest('.modal').modal('hide');
			showError('','Eliminando tipo de contenido, espere por favor...');
		}
	});	

	$('.sunniejs-tools .addButton').click(function(){
		$('body').toggleClass('show-sidebar-menu-tools');
		$('body').removeClass('show-develop-assistant');
	});

	$('.sunniejs-tools .develop-assistant').click(function(){
		$('body').toggleClass('show-develop-assistant');
		$('body').removeClass('show-sidebar-menu-tools');
	})	

	$('#ToolsComponentList').on('dragstart','[draggable="true"]', function(evt) {
		evt.originalEvent.dataTransfer.setData("id", $(this).data('id-component'));
		evt.originalEvent.dataTransfer.setData("origin", 'new');
		var tmpl = $.templates('#templateLayoutDropZone');
		var html = tmpl.render();
		$('.layout .layout-column').append(html);
	});


	$('#ToolsComponentList').on('dragend','[draggable="true"]', function(evt) {
		$('.layout .layout-drop-zone').remove();
	});

	$('.layout .layout-column').on('dragstart','.component', function(evt) {
		evt.originalEvent.dataTransfer.setData("origin", 'move');
		evt.originalEvent.dataTransfer.setData("oldPosition", $(this).data("layout-position"));
		evt.originalEvent.dataTransfer.setData("oldLayoutColumn", $(this).closest('.layout-column').data("layout-column"));
		var tmpl = $.templates('#templateLayoutDropZone');
		var html = tmpl.render();
		$('.layout .layout-column').append(html);
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
		$('.layout .layout-drop-zone').remove();
		
		var origin = evt.originalEvent.dataTransfer.getData("origin");
		var layoutColumn = $(this).closest('.layout-column').data("layout-column");
		var layoutPosition = $(this).data("layout-position");
		var oldPosition = evt.originalEvent.dataTransfer.getData("oldPosition");
		var oldLayoutColumn = evt.originalEvent.dataTransfer.getData("oldLayoutColumn");


		if(oldPosition != layoutPosition || oldLayoutColumn != layoutColumn){
			if(origin=='new'){
				var id = evt.originalEvent.dataTransfer.getData("id");
				var tmpl = $.templates('#templateNewComponent');
				var html = tmpl.render({data:id});
				$(html).insertBefore($(this));

				refreshPositions(layoutColumn);
				addComponentToPage({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"name":id})
			}
			else{
				
				var originalComponent = $('[data-layout-column='+oldLayoutColumn+'] [data-layout-position='+oldPosition+']');
				var componentToMove = originalComponent.clone(true);

				componentToMove.insertBefore($(this));
				originalComponent.remove();
				refreshPositions(layoutColumn);
				refreshPositions(oldLayoutColumn);
				moveComponent({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"oldPosition":oldPosition, "oldLayoutColumn":oldLayoutColumn})
			}
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
			var tmpl = $.templates('#templateNewComponent');
			var html = tmpl.render({data:id});
			$(html).insertBefore($(this));

			refreshPositions(layoutColumn);
			layoutPosition = $(this).closest('.layout-column').find('.component').length;
			addComponentToPage({"layoutColumn":layoutColumn,"layoutColumnPosition":layoutPosition,"name":id})
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
		$('.layout .layout-drop-zone').remove();

	});	

	$('body *').on('dragover', function(evt) {
		var dragY = evt.originalEvent.pageY;
		if((dragY - $(window).scrollTop())   < 100){
			$(window).scrollTop($(window).scrollTop() - 1 );
		}

		else if(dragY <= screen.height  && (screen.height - (dragY - $(window).scrollTop())  < 200  )){
			$(window).scrollTop($(window).scrollTop() + 1 );
		}

		else if(dragY > screen.height  && (($(window).scrollTop() + screen.height) - dragY)  < 200){
			$(window).scrollTop($(window).scrollTop() + 1 );
		}

	});

});

function refreshPositions(column){
	$('[data-layout-column='+column+'] .component').each(function(index,value){

		$(this).attr('data-layout-position',index);
		$(this).data('layout-position',index);

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
	
	getData({
		"service": apiDevelop + "/site/{idSite}/page/{idPage}/component/move",
		"method": "POST",
		"aditionalData":{"layoutColumn":layoutColumn,"layoutColumnPosition":position,"oldPosition":oldPosition,"oldLayoutColumn":oldLayoutColumn}
	});
}

function createComponent(data){
	$('.modal').modal('hide');
	dataList($('#ToolsComponentList'));
}

function editCreatedComponent(data){
	$('.modal').modal('hide');
	dataList($('#ToolsComponentList'));
}

function deleteComponentCreated(data){
	$('.modal').modal('hide');
	dataList($('#ToolsComponentList'));
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

function publishPageCallback(){
	$('#modal-error').modal('hide');
}

function dataEditPageLoadedCallback(data){
	dataList($('#modal-page-edit #layoutEditList'));
	dataList($('#modal-page-edit #pageParentPositionEdit'));
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

function checkParentPage(data,parentPosition,pagePosition){
	parentPosition = parentPosition !='' ? parentPosition + ',' : parentPosition
	$('#modal-page-edit #pageParentPositionEdit option[value^="'+parentPosition + pagePosition +'"]').attr("disabled","disabled");
	$('#modal-page-edit #pageParentPositionEdit option[value="'+parentPosition+'"]').attr('selected','selected');
}

function dataComponentLoadedCallback(data){
	$('.modal [data-service-data]:not([data-load="false"])').each(function(){
		dataList($(this));
	});

	$('#modal-component-edit [data-parent]').each(function(){
		dataParent($(this));
	});	

	$('#modal-component-edit textarea.richHTML').each(function(){
		CKEDITOR.replace( $(this).attr('id'));
	});
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
	$('#modal-site-add form')[0].reset();
	dataList($('#siteList'));
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
	dataList($('#siteList'));
}

function updateLocalesCallback(data){
	$('#modal-error').modal('hide');
}

function loadConfigComponent(){

	if($('#componentName').val() == 'component-form-filter'){
/*
		//APLICABLE SOLO AL FORM FILTER
		$('#form-edit-component [name="type"]').change(function(){

			if($(this).val() == 'select'){
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().addClass('d-none');
			}

			if($(this).val() == 'html'){
				$(this).closest('[data-array-id]').find('[name="htmlContent"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[name="htmlContent"]').parent().addClass('d-none');
			}			

		})

		$('#form-edit-component [name="type"]').each(function(){
			if($(this).val() == 'select'){
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[data-form-group="selectValues"]').parent().addClass('d-none');
			}
			if($(this).val() == 'html'){
				$(this).closest('[data-array-id]').find('[name="htmlContent"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('[data-array-id]').find('[name="htmlContent"]').parent().addClass('d-none');
			}				
		});

	*/
		//APLICABLE SOLO AL FORM FILTER

		$('#form-edit-component [name="formFilter"]').change(function(){

			if($(this).val() == 'false'){
				$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"],[name="content"]').parent().removeClass('d-none');
			}
			else{
				$(this).closest('.row').find('[name="action"],[name="method"],[name="callback"],[name="content"]').parent().addClass('d-none');
			}

		})

		if($('#form-edit-component [name="formFilter"]').val() == 'false'){
			$('#form-edit-component [name="formFilter"]').closest('.row').find('[name="action"],[name="method"],[name="callback"],[name="content"]').parent().removeClass('d-none');
		}
		else{
			$('#form-edit-component [name="formFilter"]').closest('.row').find('[name="action"],[name="method"],[name="callback"],[name="content"]').parent().addClass('d-none');
		}

	}
}


function addContentCallback(data){
	$('#modal-error').modal('hide');	
	$('#modal-content-add').modal('hide');
	$('#modal-content-add form')[0].reset();
	$('#modal-contents').modal('show');
	dataList($('#modal-contents #contentList'));
}
function editContentCallback(data){
	$('#modal-error').modal('hide');
	$('#modal-content-edit').modal('hide');
	$('#modal-contents').modal('show');
	dataList($('#modal-contents #contentList'));
}

function dataContentLoadedCallback(data){
	initSpecialTextareas($('#modal-content-edit,#modal-content-add'));
	if($('#contentTypeSelector option:eq(0)').val() == ''){
		$('#contentTypeSelector option:eq(0)').remove();
	}
	
}

function dataContentTypeLoadedCallback(data){
	initSpecialTextareas($('#modal-contentType-edit'))
	$('#form-edit-contentType #edit-contentType-block [data-event]').each(function(){
		dataEvent($(this));
	});
};

function dataComponentEditLoadedCallback(data){
	initSpecialTextareas($('#modal-component-created-edit'));
	$('#form-component-created-edit #edit-component-created-block [data-event]').each(function(){
		dataEvent($(this));
	});	
}

function componentCreateConfigCallback(data){
	$('#form-component-create #componentViewConfig [data-event]').each(function(){
		dataEvent($(this));
	});		
}

function deleteContentCallback(data){
	$('#modal-error').modal('hide');
	$('#modal-contents').modal('show');
}

function dataAddContentTypeCallback(data){
	$('#form-add-contentType #contentTypeConfig [data-event]').each(function(){
		dataEvent($(this));
	})	
}

function addContentTypeCallback(){
	$('#modal-error').modal('hide');	
	$('#modal-contentType-add').modal('hide');
	$('#modal-contentType-add form')[0].reset();
	$('#modal-contentType-list').modal('show');
}

function editContentTypeCallback(){
	$('#modal-error').modal('hide');	
	$('#modal-contentType-edit form')[0].reset();
	$('#modal-contentType-list').modal('show');
}

function deleteContentTypeCallback(data){
	$('#modal-error').modal('hide');
	$('#modal-contentType-list').modal('show');
}

function initSpecialTextareas(el){
	el.find('textarea.richHTML').each(function(){
		if(!$(this).next().hasClass('cke')){
			CKEDITOR.replace( $(this).attr('id'));
		}
	});

	el.find('textarea.codePUG').each(function(){
		var id = $(this).attr('id');
		if(!$(this).next().hasClass('CodeMirror')){
			var editor = CodeMirror.fromTextArea(document.getElementById(id), {
	        	mode: {name: "pug", alignCDATA: true},
	        	lineNumbers: true,
	        	theme:"base16-dark"
	     	 });
		}
		else{
			$('.CodeMirror').each(function(i, el){
			    el.CodeMirror.refresh();
			});
		}
	});

	el.find('textarea.codeHTML').each(function(){
		var id = $(this).attr('id');
		if(!$(this).next().hasClass('CodeMirror')){
			var editor = CodeMirror.fromTextArea(document.getElementById(id), {
	        	mode: "text/html",
          		extraKeys: {"Ctrl-Space": "autocomplete"},
	        	lineNumbers: true,
	        	theme:"base16-dark"
	     	 })
		}
		else{
			$('.CodeMirror').each(function(i, el){
			    el.CodeMirror.refresh();
			});
		}
	});
	el.find('textarea.codeCSS').each(function(){
		var id = $(this).attr('id');
		if(!$(this).next().hasClass('CodeMirror')){
			var editor = CodeMirror.fromTextArea(document.getElementById(id), {
	        	mode: "text/css",
          		extraKeys: {"Ctrl-Space": "autocomplete"},
	        	lineNumbers: true,
	        	theme:"base16-dark"
	     	 })
		}
		else{
			$('.CodeMirror').each(function(i, el){
			    el.CodeMirror.refresh();
			});
		}
	});
	el.find('textarea.codeJS').each(function(){
		var id = $(this).attr('id');
		if(!$(this).next().hasClass('CodeMirror')){
			var editor = CodeMirror.fromTextArea(document.getElementById(id), {
	        	mode: "text/javascript",
          		extraKeys: {"Ctrl-Space": "autocomplete"},
	        	lineNumbers: true,
	        	theme:"base16-dark"
	     	 })
		}
		else{
			$('.CodeMirror').each(function(i, el){
			    el.CodeMirror.refresh();
			});
		}
	});
}

function clearCKeditor(){
    for ( instance in CKEDITOR.instances ){
        CKEDITOR.instances[instance].updateElement();
    }
    CKEDITOR.instances[instance].setData('');
}