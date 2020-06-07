function ajaxError (data) {
	if(data.error !== undefined && data.error !== null){	
		var statusCode = data.error.statusCode || data.status ,
			code = data.error.code,
			message = data.error.message || data.statusText,
			dataMessage = '',
			close = true;
	}	
	if (data.responseJSON !== undefined && data.responseJSON !== null) {
		statusCode = data.responseJSON.error.statusCode;
		message = code = data.responseJSON.error.code;
		dataMessage = data.responseJSON.error.data || '',
		close = data.responseJSON.error.close !== undefined ? data.responseJSON.error.close : true;
	}
	
	if(close){
		$('.modal').modal('hide');
	}
	error(statusCode, code, message,dataMessage);
}