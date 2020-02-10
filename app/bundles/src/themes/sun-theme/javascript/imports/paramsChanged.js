function paramsChanged(){

	var filters = getParams;
	var oldFilters = JSON.parse(JSON.stringify(oldGetParams));

	var paramsChanged = [];

	Object.keys(filters).forEach(function(key) {
		
		if(oldFilters[key] !== undefined && oldFilters[key] != filters[key]){//Si el key existe pero el valor es diferente
			paramsChanged.push(key);
			delete oldFilters[key];
		}
		else if(oldFilters[key] === undefined){ //Si el key es nuevo
			paramsChanged.push(key);
		}
		else{
			delete oldFilters[key];
		}

	});

	Object.keys(oldFilters).forEach(function(key) {
		paramsChanged.push(key);
	});


	return paramsChanged;

}