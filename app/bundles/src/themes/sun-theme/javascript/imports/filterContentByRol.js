function filterContentByRol(){
	$('[data-auth-rol]').each(function(){
		if($(this).data('auth-rol') < $.cookie('id_rol')){
			$(this).remove();
		}
	});

	$('[data-auth-rol-eq]').each(function(){
		if($(this).data('auth-rol-eq') != $.cookie('id_rol')){
			$(this).remove();
		}
	});
}