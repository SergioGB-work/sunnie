	// LOGOUT DE LA PLATAFORMA
function logout(){	
	$('.logout').click(function(){
		$.ajax({
			url: api + '/usuarios/logout',
			type: 'post',
			dataType: 'json',
			data: {idSession: $.cookie('id_session')},
			complete:function(data){	
				clearBrowserData();
				window.location.href = "/${{ default.lang }}$";
	        }
		});			

	});
}