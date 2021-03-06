var lastChatResponse='';
var apiDevelop = "http://localhost:8082";

$(document).ready(function(){

	$('.component-develop-assistant form .send').click(function(){
		var message = $(this).closest('form').find('#inputChat').val();
		writeOnChat(message,'user');
		$(this).closest('form').submit();
		$(this).closest('.component-develop-assistant').find('.card-body').scrollTop($(this).closest('.component-develop-assistant').find('.card-body')[0].scrollHeight);

	});

	$('.component-develop-assistant form #inputChat').keyup(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code==13) {
			var message = $(this).closest('form').find('#inputChat').val();
			writeOnChat(message,'user');
			$(this).closest('.component-develop-assistant').find('.card-body').scrollTop($(this).closest('.component-develop-assistant').find('.card-body')[0].scrollHeight);
		}


	});

});

function addBotResponse(data){

	var msgSeguirAyudando="¿Puedo ayudarte en algo más?";
	var text = data.fulfillmentText;

	if(data.fulfillmentMessages.length > 1 ){

		data.fulfillmentMessages.forEach(function(value,index){
			var chatResponse = '';
			if(data.fulfillmentMessages[index].payload !== undefined){
				var actionCode = data.fulfillmentMessages[index].payload.fields.actionCode.stringValue;

				switch(actionCode){
					case 'SITE_ADD':
						chatResponse='';
						break;

					case 'PAGE_ADD':
						chatResponse='';
						break;

					case 'COMPONENT_ADD':

						chatResponse+='Tenemos a tu disposición los siguientes componentes:<br/>'

						var response = getData({
							"service": apiDevelop + "/component/list",
							"method": "GET", "callback":"loadComponentsOnChat"
						});

						break;

					case 'INIT_ADD_COMPONENT_PROCESS':
						getData({
							"service": apiDevelop + "/component/list",
							"method": "GET","callback":"checkComponent", "content": data
						});
						break;

					case 'END_ADD_COMPONENT_PROCESS':
						var layoutColumn = data.outputContexts[0].parameters.fields.Columna.stringValue;
						var name = "component-" + data.outputContexts[0].parameters.fields.Componente.stringValue;
						$.views.settings.allowCode(true);
						var tmpl = $.templates('#templateNewComponent');
						var html = tmpl.render({"data":name});
						$(html).insertBefore($('.layout .layout-column[data-layout-column="'+layoutColumn+'"]'));

						refreshPositions(layoutColumn);

						getData({
							"service": apiDevelop + "/site/{idSite}/page/{idPage}/component/add",
							"method": "POST","callback":"componentAddedFromDevelopAssistant",
							"aditionalData":{"layoutColumn":layoutColumn,"layoutColumnPosition": "999","name":name,"newComponent":"true"}
						});

						break;


					default:
						chatResponse += data.fulfillmentText;
						break;
				}
			}

			else{
				if(data.fulfillmentMessages[index].text.text[0] != ''){
					chatResponse += '<div class="wspre">' + data.fulfillmentMessages[index].text.text[0] + '</div>';
				}
			}

			if(chatResponse != ''){
				writeOnChat(chatResponse,'bot');
			}
		});
	}
	else{
		var chatResponse = text;
		if(chatResponse != ''){
			writeOnChat(chatResponse,'bot');
		}
	}
}


function writeOnChat(msg,profile){

	var color = '';

	switch(profile){
		case 'user':
			color = 'alert-success';
			break;
		
		case 'error':
			color = 'alert-danger';
			break;

		case 'bot':
			color = 'alert-info';
			break;

		case 'warning':
			color = 'alert-warning';
			break;

		default:
			color = 'alert-info';3
			break;
	}
	
	var align = profile == 'user' ? 'float-right' : 'float-left';
	var template = "<div class='float-left w-100'><div class='alert "+color+" w-90 "+align+"'>" + msg + "</div></div>"

	$('.component-develop-assistant form')[0].reset();
	$('#conversation').append(template);
	$('.component-develop-assistant').find('.card-body').scrollTop($('.component-develop-assistant').find('.card-body')[0].scrollHeight);
}

function loadComponentsOnChat(data){
	$.views.settings.allowCode(true);
	var tmpl = $.templates('#templateComponentListDevelopAssistantBot');
	var html = tmpl.render({"data":data});
	writeOnChat(html,'bot');
}

function loadLayoutColumnsOnChat(data){
	writeOnChat('Estas son las columnas disponibles en esta página','bot');
	$.views.settings.allowCode(true);
	var tmpl = $.templates('#templateLayoutColumnsListDevelopAssistantBot');
	var html = tmpl.render({"data":data});

	if(data != ''){
		writeOnChat(html,'bot');
	}
	
}

function componentAddedFromDevelopAssistant(data){

	if(data.error !== undefined){
		writeOnChat('Se ha producido un error al intentar agregar tu componente, es posible que algún dato introducido no sea correcto. Por favor vuelve a introducir la columna donde quieres colocarlo.','error');
	}
	else{
		writeOnChat('Tu componente se ha añadido correctamente.','bot');
		writeOnChat('¿Puedo ayudarte en algo más mi señor?','bot');	
		$.views.settings.allowCode(true);
		var tmpl = $.templates('#templateNewComponent');
		var html = tmpl.render({"data":name});
		$(html).insertBefore($('.layout .layout-column[data-layout-column="'+layoutColumn+'"]'));

		refreshPositions(layoutColumn);
	}
}

function addingComponent(){
	writeOnChat('Tu componente se está añadiendo, espera unos segundos y estará listo. Lo podrás ver al final de la página','bot');
}

function checkComponent(data,result){
	if(result.outputContexts[0].parameters.fields.Componente.stringValue == '' || !data.includes('component-' + result.outputContexts[0].parameters.fields.Componente.stringValue)){
		writeOnChat("El componente que has elegido no existe o no está disponible. Por favor, introduce un nombre válido.",'error');
	}
	else{
		var response = getData({
			"service": apiDevelop + "/layout/detail/{idLayout}",
			"method": "GET", "callback":"loadLayoutColumnsOnChat"
		});
		/*
		if(result.fulfillmentText != ''){
			writeOnChat(result.fulfillmentText,'bot');
		}*/
	}
}