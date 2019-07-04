var lastChatResponse='';
var apiDevelop = "http://localhost:8082";

$(document).ready(function(){

	$('.component-develop-assistant form .send').click(function(){
		var message = $(this).closest('form').find('#inputChat').val();
		writeOnChat(message,'user');
		$(this).closest('form').submit();

		$('#conversation').scrollTop($('#conversation')[0].scrollHeight);

	});

	$('.component-develop-assistant form #inputChat').keyup(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code==13) {
			var message = $(this).closest('form').find('#inputChat').val();
			writeOnChat(message,'user');
			$('#conversation').scrollTop($('#conversation')[0].scrollHeight);
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
				chatResponse += '<div class="wspre">' + data.fulfillmentMessages[index].text.text[0] + '</div>';
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
			color = 'alert-info';
			break;
	}
	
	var align = profile == 'user' ? 'float-right' : 'float-left';
	var template = "<div class='float-left w-100'><div class='alert "+color+" w-75 "+align+"'>" + msg + "</div></div>"

	$('.component-develop-assistant form')[0].reset();
	$('#conversation').append(template);
	$('#conversation').scrollTop($('#conversation')[0].scrollHeight);
}

function loadComponentsOnChat(data){
	var chatResponse = $("<div />").append($.tmpl($('#templateComponentListDevelopAssistantBot'), {"data":data})).html()
	writeOnChat(chatResponse,'bot');
}

function loadLayoutColumnsOnChat(data){
	writeOnChat('Estas son las columnas disponibles en esta página','bot');
	var chatResponse = $("<div />").append($.tmpl($('#templateLayoutColumnsListDevelopAssistantBot'), {"data":data})).html()
	writeOnChat(chatResponse,'bot');
}

function componentAddedFromDevelopAssistant(data){

	if(data.error !== undefined){
		writeOnChat('Se ha producido un error al intentar agregar tu componente, es posible que algún dato introducido no sea correcto. Por favor vuelve a introducir la columna donde quieres colocarlo.','error');
	}
	else{
		writeOnChat('Tu componente se ha añadido correctamente.','bot');
		writeOnChat('¿Puedo ayudarte en algo más mi señor?','bot');		
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

		writeOnChat(result.fulfillmentText,'bot');
	}

}