function loopbackPaginationConnector(filter,page,items_per_page){
	if (page !== undefined && page != '' && page > 0 && filter.indexOf('filter[skip]') <= -1 && getParams['filter[limit]'] != 0) {
		page = ((page - 1) * items_per_page);
		filter += '&filter[skip]=' + page;
	}

	if (items_per_page !== undefined && items_per_page != '' && items_per_page > 0 && filter.indexOf('filter[limit]') <= -1 && (getParams['filter[limit]'] < 0 || getParams['filter[limit]'] === undefined)) {
		filter += '&filter[limit]=' + items_per_page;
	}

	return filter;
}