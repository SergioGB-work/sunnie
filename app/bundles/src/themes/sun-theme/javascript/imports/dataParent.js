function dataParent(el){
	var targetEvent = $(el.data('parent'));
	var action = el.data('parent-event-action');
	var valueDispatchAction =  el.data('parent-event-value') != '' && el.data('parent-event-value')!== undefined ? el.data('parent-event-value') : false;
	var parentEvent =  el.data('parent-event');
	var currentEvent = el;
	var name = $(targetEvent).attr('name');
	var id = el.data('id');

	if(parentEvent != ''){
		targetEvent.on(parentEvent, function(){

			if($(this).closest('[data-array-id]').length > 0){
				currentEvent = $(this).closest('[data-array-id]').find('[data-id="'+el.data('id')+'"]');
			}

			switch(action){

				case 'load-data':
					if(!valueDispatchAction || valueDispatchAction == $(this).val()){
						var value = el.val();
						var nameKeyJSON= {};
						nameKeyJSON[name] = value;
						currentEvent.data('service-data',currentEvent.attr('data-service-data').replace('{'+name+'}',value));
						currentEvent.attr('data-aditional-data',JSON.stringify(nameKeyJSON));
						currentEvent.data('aditional-data',{"value":value});
						dataList(currentEvent);
					}
					break;
				
				case 'submit':
					if(!valueDispatchAction || valueDispatchAction.toString().includes($(this).val())){
						currentEvent.closest('form').submit();
					}
					break;

				case 'show':
					
					if(!valueDispatchAction || valueDispatchAction.toString().includes($(this).val())){
						currentEvent.removeClass('d-none');;
					}
					else{
						currentEvent.addClass('d-none');
					}
					
					break;

				case 'hide':
					if(!valueDispatchAction || valueDispatchAction.toString().includes($(this).val())){
						currentEvent.addClass('d-none');
					}
					else{
						currentEvent.removeClass('d-none');
					}
					break;
			}

		});
	}
	if(valueDispatchAction.toString().includes(targetEvent.val())){
		targetEvent.change();
	}
}