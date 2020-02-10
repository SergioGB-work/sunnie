function setDefaultValue(el){

	var defaultValue = el.data('get-default-value');

	if(el.parents('[data-rel]').length > 0){
		defaultValue = defaultValue + '_' + el.parents('[data-rel]').data('rel');
	}

	var paramValue = getParams[defaultValue];

	if(paramValue !== undefined && paramValue !== null){

		if(el.is("select")){
			el.find('option[value="'+paramValue+'"]').attr('selected','selected')
		}

		else if(el.is("textarea")){
			el.val(paramValue);
		}

		else{
			if(el.is(':checkbox') && el.val() == paramValue){
				el.prop('checked',true)
			}
			else if(el.is(':radio') && el.val() == paramValue){
				el.prop('checked',true)
			}
			else if(!el.is(':radio') && !el.is(':checkbox')){
				el.val(paramValue);
			}	
		}
	}	
}