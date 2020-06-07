$(document).ready(function(){

	activeCurrentNavigationPage();


	formSubmit();

	loadEvents('body');

	// GENERALIZACIÓN DE EVENTOS
	$(document).on('change','[data-onchange]',function(){
		var evt = $(this).data('onchange');
		eval(evt + '()');
	});

	$(document).on('click','[data-onclick]',function(){
		var evt = $(this).data('onclick');
		eval(evt + '()');
	});

	// SETEAR EL VALOR POR DEFECTO A PARTIR DE LOS PARAMETROS DE LA URL
	loadFormFiltersDefaultValues();

	// ACTIVACION DE POPOVERS
	popover();

	// GESTION DE CONTENIDO POR ROLES
	filterContentByRol();

	logout();

	//AJAX GLOBALS
	//Cada vez que se realiza una peticion AJAX muestra loading y cuando termina se oculta
	$(document).ajaxSend(function (event, request, settings) {
	    showLoading();
	});

	$(document).ajaxComplete(function () {
	    hideLoading();
	    setAllImgDefault();
	});	

	$(document).ajaxError(function () {
	    hideLoading();
	    setAllImgDefault();
	});	

});

$(window).load(function(){
	setAllImgDefault();
});





