function processData(dataResponse, target, template, callback, content, totalItems, requestData) {
	var data = { "data": dataResponse };
	var total = 1;
	if (totalItems !== null && totalItems !== undefined && totalItems > 1) {
		total = totalItems;
		data.data['totalItems'] = total;
	}

	if ((target != '') && (template != '') && (template !== undefined) && (target !== undefined)) {
		$(target).html('');
		$.views.settings.allowCode(true);
		var tmpl = $.templates(template);
		var html = tmpl.render(data);
		$(target).html(html);
	}

	loadEvents(target);

	if ((callback != '') && (callback !== undefined)) {

		var exec = callback + '(' + JSON.stringify(dataResponse) +',' + total + ',' + requestData + ')';

		if (content != '') {

			if (typeof (content) == 'object') {
				content = JSON.stringify(content);
			}

			exec = callback + '(' + JSON.stringify(dataResponse) + ',' + content + ',' + total + ','+ requestData + ')';
		}
		
		var f = eval(exec);
	}

	$(target).find('[data-selected]').addBack('[data-selected]').each(function(){
		var selectedValue = $(this).attr('data-selected');
		var selectedTarget = $(this).attr('data-selected-target');

		selectedValue.split(',').forEach(function(value){
			$(selectedTarget).find('option[value="'+value+'"]').attr('selected','selected');
		})
	})

	$(target).find('[data-checked]').addBack('[data-checked]').each(function(){
		var checkedValue = $(this).attr('data-checked');
		var checkedTarget = $(this).attr('data-checked-target');

		checkedValue.split(',').forEach(function(value){
			$(checkedTarget).find('input[value="'+value+'"]').attr('checked','checked');
		})
	})

}