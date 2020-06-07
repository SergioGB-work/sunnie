$(document).ready(function(){
	$('.component-form-filter [data-toggle="tooltip"]').tooltip();

	$('.component-form-filter form[data-form-filter="true"]').attr('data-action',window.location.pathname)

})

function redirect(data,page){
	window.location.href='/tarificador/${{ default.lang }}$' + page;
}