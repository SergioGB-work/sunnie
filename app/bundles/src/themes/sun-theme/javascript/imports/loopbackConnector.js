//Traductor de Loopback
//Traduce los parametros de la URL a la sintaxis que utiliza loopback de filtros

function loopbackConnector(key,val,params,count){

	var filter = '';

	if (key == 'order' || key == 'group') {
		filter += '&filter[' + key + ']=' + getParams[val];
	}

	else if (key == 'query') {
		var regexp = new RegExp("searchField\\d*" + rel, 'g');;
		var n = 0;
		$.each(params, function (index, value) {
			if (value.search(regexp) > -1) {
				filter += '&filter[where][and][' + n + '][' + getParams[value] + '][like]=%' + getParams[val] + '%';
				n++;
			}
		})
		count++;
	}

	else if (key.indexOf('searchField') < 0 && key != '' && key.indexOf('action') < 0 && key.indexOf('filter') < 0) {
		var value = getParams[val] || '';
		if (value != '') {
			if (value.indexOf('=') < 0) {
				value = '=' + value;
			}

			filter += '&filter[where][and][' + count + '][' + key + ']' + value;
		}
		count++;
	}

	else if (((key != 'filter[limit]') || (key == 'filter[limit]' && (getParams[val] > 0))) && key.indexOf('searchField') < 0) {
		filter += '&' + key + '=' + getParams[val];
	}

	return {"filter":filter, "count" : count};
}