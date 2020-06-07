function htmlComponentEditViewCallback(data){
	$('#editContentListContent').on('change','input[type="radio"]', function(){
		if($(this).is(':checked')){
			$(this).parent().find('[name="contentType"]').attr('checked', 'checked');
		}
	});
}