var enableFlag= false; /** This flag is used to control that mobile script run once **/

$(document).ready(function(){

	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var body = $('body');
	
	if((windowWidth < 768)&&(!enableFlag)){
		enableMobileJS();
		enableFlag = true;
	}
	else{

		disableMobileJS();
	}

	if(windowWidth > windowHeight){
		body.addClass('horizontal-mode');
		disableMobileJSVertical();
		enableMobileJSHorizontal();		
	}
	
	else{
		body.addClass('vertical-mode');
		disableMobileJSHorizontal();
		enableMobileJSVertical();		
	}
		
});

$(window).resize(function(){

	var windowWidth = $(window).width();
	var body = $('body');
	
	if((windowWidth < 768)&&(!enableFlag)){
		/** Enable JS Scripts **/
		enableMobileJS();		
		
		if(windowWidth <= windowHeight){	
			body.addClass('vertical-mode');
			body.removeClass('horizontal-mode');
			enableMobileJSVertical();
		}
		
		else{	
			body.addClass('horizontal-mode');
			body.removeClass('vertical-mode');
			enableMobileJSHorizontal();
		}		
		
		enableFlag = true;
		
		
		
	}
	
	else if((windowWidth < 768)&&(enableFlag)){
				
			if(windowWidth <= windowHeight){	
				body.addClass('vertical-mode');
				body.removeClass('horizontal-mode');
				disableMobileJSHorizontal();
				disableMobileJSVertical();
				enableMobileJSVertical();
			}
			else{	
				body.addClass('horizontal-mode');
				body.removeClass('vertical-mode');
				disableMobileJSVertical();
				disableMobileJSHorizontal();
				enableMobileJSHorizontal();
			}

	}
	
	else if(windowWidth >= 768){
		/** Disable JS Script **/
		disableMobileJS();
		disableMobileJSVertical();
		disableMobileJSHorizontal();
		enableFlag = false;
	}

});



function enableMobileJS(){
	// Funcion que habilita todos los scripts que se ejecutaran en la version mobile

}

function disableMobileJS(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version mobile
	// Debe deshabilitar todos los script que han sido lanzados desde enableMobileJS

}

function enableMobileJSVertical(){
	// Funcion que habilita scripts especificos dentro de la version mobile solo cuando esta en vertical

}

function disableMobileJSVertical(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version mobile vertical
	// Debe deshabilitar todos los script que han sido lanzados desde enableMobileJSVertical

}

function enableMobileJSHorizontal(){
	// Funcion que habilita scripts especificos dentro de la version mobile solo cuando esta en horizontal

}

function disableMobileJSHorizontal(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version mobile horizontal
	// Debe deshabilitar todos los script que han sido lanzados desde enableMobileJSHorizontal

}