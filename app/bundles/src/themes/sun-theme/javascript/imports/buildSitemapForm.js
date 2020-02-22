function buildSitemapForm(elemento){ 
	var originalGroup = elemento.data('form-group');
	var isArray = elemento.data('block-type') == 'array' ? true : false;
	var aux = {};
	var data = {};

	if(isArray){
		aux[originalGroup] = [];
		elemento.find('[data-array-id]').each(function(){
			
			if($(this).closest('[data-form-group]').data('form-group') == originalGroup ){
                var arrayInputs = {};
                var arrayGroup = [];

                $(this).find('input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):not([name$="-fileHidden"]):not([type="submit"]),select,textarea,input[type="radio"]:checked,input[type="checkbox"]:checked').each(function(){
                    //Caso basico
                    if( $(this).closest('[data-form-group]').data('form-group') == originalGroup ){
                        if($(this).data('rel')){
                            var name = $(this).attr('name').split('_' + $(this).data('rel'))[0];
                        }
                        else{
                            var name = $(this).attr('name');
                        }
                        var value =  $(this).attr("type") == "checkbox" ? true : $(this).val();
                        arrayInputs[name]=value;
                    }

                    else if(!arrayGroup.includes($(this).closest('[data-form-group]').data('form-group'))){
                        arrayInputs = Object.assign(arrayInputs,buildSitemapForm($(this).closest('[data-form-group]')));
                        arrayGroup.push($(this).closest('[data-form-group]').data('form-group'));

                    }

                });	

                if(JSON.stringify(arrayInputs) != '{}'){
                    aux[originalGroup].push(arrayInputs);
                }
        	}

		})
	}	
	else{
		aux[originalGroup] = {};	
		var arrayGroup = [];
		var arrayInputs = {};
		
		elemento.find('input:not([type="radio"]):not([type="checkbox"]):not([type="file"]):not([name$="-fileHidden"]):not([type="submit"]),select,textarea,input[type="radio"]:checked,input[type="checkbox"]:checked').each(function(){
            //Caso basico
			
			var currentGroup = $(this).parents('[data-form-group]');

            if( currentGroup.data('form-group') == originalGroup ){
                var name = $(this).attr('name');
                var value = $(this).attr("type") == "checkbox" ? true : $(this).val();
                arrayInputs[name]=value;

            }

			else if(currentGroup.parents('[data-form-group]').data('form-group') == originalGroup ){
                if(!arrayGroup.includes($(this).closest('[data-form-group]').data('form-group'))){
                    arrayInputs = Object.assign(arrayInputs,buildSitemapForm($(this).closest('[data-form-group]')));
                    arrayGroup.push($(this).closest('[data-form-group]').data('form-group'));

                }
        	}

        });	

		if(JSON.stringify(arrayInputs) != '{}'){
            aux[originalGroup] = (arrayInputs);
        }	
	}

	return aux;
}
