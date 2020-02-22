function dataEvent(el){
	var targetEvent = $(el.data('event-target'));
	var action = el.data('event-action');
	var valueDispatchAction =  el.data('event-value') != '' && el.data('event-value') !== undefined ? el.data('event-value') : false;
	var event =  el.data('event');
	var currentEvent = el;
	var name = el.attr('name');

	if(event != ''){
		el.on(event, function(){

			if($(this).closest('[data-array-id]').length > 0 && targetEvent.closest('[data-array-id]').length > 0){
				targetEvent = $(this).closest('[data-array-id]').find($(this).data('event-target'));
			}

			var actions = action.split(',');
			var currentEventNode = $(this);
			actions.forEach(function(actionValue){
				switch(actionValue){
					
					case 'load-data':
						if(!valueDispatchAction || (valueDispatchAction.toString().includes(currentEventNode.val()) && currentEventNode.val() != '')){
							var value = currentEventNode.val();
							var nameKeyJSON = {}; 
							nameKeyJSON[name] = value;
							targetEvent.data('service-data',targetEvent.attr('data-service-data').replace('{'+name+'}',value));
							targetEvent.attr('data-aditional-data',JSON.stringify(nameKeyJSON));
							targetEvent.data('aditional-data',nameKeyJSON);

							dataList(targetEvent);
						}
						break;
					
					case 'submit':
						if(!valueDispatchAction || (valueDispatchAction.toString().includes(currentEventNode.val()) && currentEventNode.val() != '')){
							targetEvent.closest('form').submit();
						}
						break;
		
					case 'show':
						if(!valueDispatchAction || (valueDispatchAction.toString().includes(currentEventNode.val()) && currentEventNode.val() != '')){
							targetEvent.removeClass('d-none');
						}
						else{
							targetEvent.addClass('d-none');
						}
						
						break;

					case 'hide':
						if(!valueDispatchAction || (valueDispatchAction.toString().includes(currentEventNode.val()) && currentEventNode.val() != '')){
							targetEvent.addClass('d-none');
						}
						else{
							targetEvent.removeClass('d-none');
						}
						break;
				}
			});

		});
	}
	if(valueDispatchAction.toString().includes(el.val())){
		el.change();
	}
}