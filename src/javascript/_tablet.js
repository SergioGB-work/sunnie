var enableFlag= false; /** This flag is used to control that Tablet script run once **/

$(document).ready(function(){

	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var body = $('body');
	
	if((windowWidth <= 1024)&&(!enableFlag)){
		enableTabletJS();
		enableFlag = true;
	}
	else{

		disableTabletJS();
	}

	if(windowWidth > windowHeight){
		body.addClass('horizontal-mode');
		disableTabletJSVertical();
		enableTabletJSHorizontal();		
	}
	
	else{
		body.addClass('vertical-mode');
		disableTabletJSHorizontal();
		enableTabletJSVertical();		
	}
		
});

$(window).resize(function(){

	var windowWidth = $(window).width();
	var body = $('body');
	
	if((windowWidth <= 1024)&&(!enableFlag)){
		/** Enable JS Scripts **/
		enableTabletJS();		
		
		if(windowWidth <= windowHeight){	
			body.addClass('vertical-mode');
			body.removeClass('horizontal-mode');
			enableTabletJSVertical();
		}
		
		else{	
			body.addClass('horizontal-mode');
			body.removeClass('vertical-mode');
			enableTabletJSHorizontal();
		}		
		
		enableFlag = true;
		
		
		
	}
	
	else if((windowWidth <= 1024)&&(enableFlag)){
				
			if(windowWidth <= windowHeight){	
				body.addClass('vertical-mode');
				body.removeClass('horizontal-mode');
				disableTabletJSHorizontal();
				disableTabletJSVertical();
				enableTabletJSVertical();
			}
			else{	
				body.addClass('horizontal-mode');
				body.removeClass('vertical-mode');
				disableTabletJSVertical();
				disableTabletJSHorizontal();
				enableTabletJSHorizontal();
			}

	}
	
	else if(windowWidth > 1024){
		/** Disable JS Script **/
		disableTabletJS();
		disableTabletJSVertical();
		disableTabletJSHorizontal();
		enableFlag = false;
	}

});



function enableTabletJS(){
	// Funcion que habilita todos los scripts que se ejecutaran en la version Tablet

}

function disableTabletJS(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version Tablet
	// Debe deshabilitar todos los script que han sido lanzados desde enableTabletJS

}

function enableTabletJSVertical(){
	// Funcion que habilita scripts especificos dentro de la version Tablet solo cuando esta en vertical

}

function disableTabletJSVertical(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version Tablet vertical
	// Debe deshabilitar todos los script que han sido lanzados desde enableTabletJSVertical

}

function enableTabletJSHorizontal(){
	// Funcion que habilita scripts especificos dentro de la version Tablet solo cuando esta en horizontal

}

function disableTabletJSHorizontal(){
	// Funcion que deshabilita todos los scripts que se ejecutaran en la version Tablet horizontal
	// Debe deshabilitar todos los script que han sido lanzados desde enableTabletJSHorizontal

}