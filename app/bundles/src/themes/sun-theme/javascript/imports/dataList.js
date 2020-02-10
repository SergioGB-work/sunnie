// GENERALIZACION DE LISTADOS DE DATOS
function dataList(el) {
	var el = el;
	var live;

	var service = el.data('service-data') || '',
		items_per_page = el.data('items-per-page'),
		initial_page = el.data('initial-page'),
		callback = el.data('callback') || '',
		method = el.data('method') || 'GET',
		content = el.data('content') || '',
		template = el.data('template') || '',
		target = el.data('target') || '',
		aditionalData = el.data('aditional-data'),
		enableGetParams = el.data('enable-get-params'),
		getParamsList = el.data('get-params-list'),
		liveReload = el.data('live-reload') || 'false',
		timeReload = el.data('time-reload') || 60000,
		cache = el.data('cache') || 'false',
		rel = el.data('rel') || '',
		noReload = el.data('noreload'),
		private = el.data('private');
	


	var params = { "service": service, "method": method, "template": template, "target": target, "page": initial_page, "items_per_page": items_per_page, "aditionalData": aditionalData, "callback": callback, "content": content, "enableGetParams": enableGetParams, "getParamsList": getParamsList, "rel": rel, "cache": cache,"noReload":noReload,"private":private};

	if(el.data('has-pagination')==true){	
		var	service_data_all_pagination = el.data('pagination-service-data-all') || el.data('service-data') || '',
			items_per_page_pagination = el.data('pagination-items-per-page') || el.data('items-per-page'),
			initial_page_pagination = el.data('pagination-initial-page') || el.data('initial-page'),
			pagination_target_pagination = el.data('pagination-container-target') || '.pagination',
			service_data_pagination = el.data('pagination-service-data') || el.data('service-data') || '',
			method_pagination = el.data('pagination-method') || el.data('method') || '',
			content_pagination = el.data('pagination-content') || el.data('content') || '',
			template_pagination = el.data('pagination-template') || el.data('template') || '',
			target_pagination = el.data('pagination-target') || el.data('target') || '',
			callback_pagination = el.data('pagination-callback') || el.data('callback') || '',
			aditionalData_pagination = el.data('pagination-aditional-data') || el.data('aditional-data') || '',
			enableGetParams_pagination = el.data('pagination-enable-get-params') || el.data('enable-get-params') || '',
			getParamsList_pagination = el.data('pagination-get-params-list') || el.data('get-params-list') || '',
			liveReload_pagination = el.data('pagination-live-reload') || el.data('live-reload') || 'false',
			timeReload_pagination = el.data('pagination-time-reload') || el.data('time-reload') || 60000,
			cache_pagination = el.data('pagination-cache') || el.data('cache') || 'false',
			rel_pagination = el.data('pagination-rel') || el.data('rel') || '',
			noReload_pagination = el.data('pagination-noreload') || el.data('noreload') || 'false',
			private_pagination = el.data('pagination-private') || el.data('private') || 'false';
		var paramsPagination = { service: service_data_pagination, method_pagination: method, template: template_pagination, target: target_pagination, page: initial_page_pagination, pagination_target: pagination_target_pagination, items_per_page: items_per_page_pagination, callback: callback_pagination, content: content_pagination, enableGetParams: enableGetParams_pagination, getParamsList: getParamsList_pagination, rel: rel_pagination, cache: cache_pagination, noReload: noReload_pagination, private: private_pagination };
		params['pagination'] = paramsPagination;
	}		

	getData(params);

	clearInterval(live);

	if (liveReload == 'true') {
		live = setInterval(getData(params), timeReload);
	}
}