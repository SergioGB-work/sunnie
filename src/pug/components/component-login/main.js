function callbackLogin(data){
	if(data=="USER_ERR_LOGIN"){
		error(data);
	}
	else{
		var id_session = data.tokenJWT;
		var username = data.username;
		var id_rol = data.rol;
		var id_client = data.client || 0;

		$.cookie('id_session', id_session, { expires: 0.5 , path: '/'});
		$.cookie('username', username, { expires: 0.5 , path: '/'});
		$.cookie('id_rol', id_rol, { expires: 0.5 , path: '/'});
		$.cookie('id_client', id_client, { expires: 0.5 , path: '/'});
		$.cookie('id_tienda', '55', { expires: 0.5 , path: '/'});

		window.location.href="./home.html";
	}	
}