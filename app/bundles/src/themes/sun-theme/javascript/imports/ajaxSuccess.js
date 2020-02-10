function ajaxSuccess(data, textStatus, xhr, cache, target, template, callback, content, el, requestData){
	var dataResponse = data;
	if (cache == true) {
		sessionStorage.setItem(url + '_${{ default.lang }}$', JSON.stringify(dataResponse));
	}
	processData(dataResponse, target, template, callback, content, xhr.getResponseHeader('Pagination-Count'), requestData);				

	if(el.pagination != undefined && el.pagination!=null){
		generatePagination(dataResponse,el.pagination,xhr.getResponseHeader('Pagination-Count'));
	}
}