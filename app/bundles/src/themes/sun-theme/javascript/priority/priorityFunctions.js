// Si la session a expirado se redirige al usuario a la home.
var cookies = getCookies();
var getParams = loadParams();
var oldGetParams = loadParams();

function getCookies(){
	var cookies = document.cookie.replace(' ','').split(';');
	var data = [];

	cookies.forEach( function(valor, indice, array) {
		valor = valor.split('=');
		if(valor[0]!='' && valor[0]!== undefined){
			data[valor[0].trim()]=valor[1].trim();
		}
	});

	return data;

}

function checkSession(){
	if(!cookies){
		window.location.href="./";
	}
	else if(cookies['id_session']=='' || cookies['id_session']==undefined){
		window.location.href="./sessionExpired.html";
	}
}

function checkRol($rol){
	if(cookies['id_rol'] == '' || cookies['id_rol']==undefined || cookies['id_rol'] > $rol){
		window.location.href="./errorRol.html";
	}
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loadParams() {
  var a = window.location.search.substr(1).split('&');
  if (a == "") return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=', 2);
    if (p.length == 1)
      b[p[0]] = "";
    else
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
}

function reloadGetParams(){

	oldGetParams = getParams;
	getParams = loadParams();
}

// This is the "Offline page" service worker

// Add this below content to your HTML page, or add the js file to your page at the very top to register service worker

// Check compatibility for the browser we're running this in
if ("serviceWorker" in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("sw.js", {
        scope: "./"
      })
      .then(function (reg) {
        console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      });
  }
}