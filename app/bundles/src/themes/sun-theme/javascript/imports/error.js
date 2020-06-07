function error(statusCode, code, message, dataMessage) {

	message = message === undefined ? '' : message;
	var title = '',
		content = message,
		HTML = false;

	switch (statusCode) {

		case 200:
			content = '200: ${{ default.operationOK }}$';
			break;

		case 201:
			content = '201: ${{ default.operationOK }}$';
			break;

		case 204:
			title="${{ default.errorLoginTitle }}$";
			content = '204: ${{ default.errorLoginContent }}$';
			break;

		case 400:
			content = '400:' + message;
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
			content = '404:' + message;
			break;

		case 405:
			content = '405:' + message;
			break;

		case 406:
			content = '406:' + message;
			break;	

		case 409:
			content = '409:' + message;
			break;

		case 415:
			content = '415:' + message;
			break;	
					
		case 500:
			content = '500:' + message;
			break;

		case 'COMPONENT_CREATE_ERROR':
			content = 'Se ha producido un error al crear el componente. Comprueba que el formato PUG de la vista es correcto e inténtalo de nuevo';
			break;

		case 'COMPONENT_CREATE_ERROR_NAME_IN_USE':
			content = 'Ya existe un componente con ese nombre. Inténtalo de nuevo';
			break;		

		case 'COMPONENT_EDIT_ERROR':
			content = 'Se ha producido un error al editar el componente. Comprueba que el formato PUG de la vista es correcto e inténtalo de nuevo';
			break;

		case 'COMPONENT_EDIT_ERROR_NOT_EXISTS':
			content = 'El componente que estás intentando editar no existe. Inténtalo de nuevo';
			break;	

		case 'DELETE_COMPONENT_ERROR':
			content = 'Se ha producido un error al intentar eliminar el componente de la página. Inténtalo de nuevo';
			break;

		case 'COMPONENT_DELETE_ERROR_IN_USE':
			content = 'No ha sido posible eliminar el componente ya que se encuentra en uso por algún site.';
			break;		

		case 'COMPONENT_DELETE_ERROR_NOT_EXIST':
			content = 'El componente que estás intentando eliminar no existe. Inténtalo de nuevo';
			break;

		case 'LAYOUT_LIST_ERROR':
			content = 'Se ha producido un error al intentar obtener el listado de layouts. Inténtalo de nuevo.';
			break;

		case 'LAYOUT_DETAIL_ERROR':
			content = 'Se ha producido un error al intentar obtener el detalle de la layout. Inténtalo de nuevo.';
			break;

		case 'COMPONENT_LIST_ERROR':
			content = 'Se ha producido un error al intentar obtener el listado de componentes. Inténtalo de nuevo.';
			break;

		case 'COMPONENT_DETAIL_ERROR':
			content = 'Se ha producido un error al intentar obtener el detalle del componente. Inténtalo de nuevo.';
			break;

		case 'COMPONENT_CONFIG_ERROR':
			content = 'Se ha producido un error al intentar obtener la configuración del componente. Inténtalo de nuevo.';
			break;

		case 'THEME_LIST_ERROR':
			content = 'Se ha producido un error al intentar obtener el listado de temas de apariencia. Inténtalo de nuevo.';
			break;		

		case 'SITE_LIST_ERROR':
			content = 'Se ha producido un error al intentar obtener el listado de sites. Inténtalo de nuevo.';
			break;

		case 'PUBLISH_SITE_ERROR':
			content = 'Se ha producido un error al intentar publicar el site. Inténtalo de nuevo.';
			break;

		case 'ADD_SITE_ERROR':
			content = 'Se ha producido un error al intentar crear el site. Inténtalo de nuevo.';
			break;

		case 'EDIT_SITE_ERROR':
			content = 'Se ha producido un error al intentar editar el site. Inténtalo de nuevo.';
			break;

		case 'DELETE_SITE_ERROR':
			content = 'Se ha producido un error al intentar eliminar el site. Inténtalo de nuevo.';
			break;				

		case 'SITE_DETAIL_ERROR':
			content = 'Se ha producido un error al intentar obtener los datos del site. Inténtalo de nuevo.';
			break;

		case 'SITE_LOAD_LOCALE_LIST_ERROR':
			content = 'Se ha producido un error al intentar obtener el listado de variables de traducción del site. Inténtalo de nuevo.';
			break;

		case 'FILE_FORMAT_ERROR':
			content = 'El formato del fichero no es válido. Inténtelo de nuevo con otro formato.';
			break;				

		case 'FILE_UPLOAD_ERROR':
			content = 'Se ha producido un error al intentar subir el fichero. Inténtalo de nuevo.';
			break;

		case 'FILE_DELETE_NOT_EXIST_ERROR':
			content = 'Se ha producido un error al intentar eliminar el fichero. El fichero no existe.';
			break;

		case 'PUG_INVALID_INDENTATION':
			content = 'Se ha producido un error en tu plantilla PUG. La indentación de PUG no es correcta.\n';
			content +='Mensaje original: ' + dataMessage 
			break;

		case 'PUG_INVALID_KEY_CARACTER':
			content = 'Se ha producido un error en tu plantilla PUG. Caracter inesperado en PUG.\n';
			content +='Mensaje original: ' + dataMessage 
			break;

		case 'PUG_NO_END_BRACKET':
			content = 'Se ha producido un error en tu plantilla PUG. Se ha encontrado un string sin un ) de cierre.\n';
			content +='Mensaje original: ' + dataMessage 
			break;

		case 'PUG_MIXIN_WITHOUT_BODY':
			content = 'Se ha producido un error en tu plantilla PUG. Declarado mixin sin body.\n';
			content +='Mensaje original: ' + dataMessage 
			break;

		default:
			content = statusCode + ':${{ default.unknownError }}$ .'+ message;
	}

	switch (code) {
		//Extend to custom errors
	}

	if(HTML){
		showHTMLError(title, content);
	}
	else{
		showError(title, content);
	}
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