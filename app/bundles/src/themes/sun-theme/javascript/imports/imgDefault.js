// IMAGENES POR DEFECTO
// Establece una imagen por defecto para todas las imagenes rotas
function setAllImgDefault(){
	$('img').on('load',function(){
		if($(this).get(0).naturalWidth == 0){
			$(this).attr('src', defaultImg);
		}
	});
}

function setImgDefault(el){
	$(el).attr('src', defaultImg);
}