function loadFormFiltersDefaultValues(){
	$('[data-get-default-value]').each(function(e){
		setDefaultValue($(this));
	});
}