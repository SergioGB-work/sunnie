var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs');


/** API SERVER **/
gulp.task('apiServer', function() {
	
	app = express();
	var router = express.Router();

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.use(function(req, res, next) {
  		res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
    	res.setHeader("Access-Control-Allow-Credentials", "true");
    	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
		next();
	});

	//FALTA DEFINIR LOS PARAMETROS DE CREACION
	app.post('/page/add', function (req, res) {
		var sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json'));
		var position = req.body.position || [sitemap.pages.length] ;
		var patron = "sitemap.pages";

		var newPage = {
			"id":"pages2",
			"name": "Pages",
			"url": "/pages",
			"src": "/pages.html",
			"attributes":{
				"title":"Pages",
				"description":"Lorem Ipsum Pages",
				"keywords":"Pages key"
			},
			"layout":{
				"name":"layout-12-fluid",
				"content":{
					"content_upper":[
						{
							"name":"component-pages",
							"showTitle":"false",
							"full":"true"
						}
					]
				}
			},
			"childs": []
		};

		position.forEach(function(element,i){
			if(i == (position.length - 1)){
				patron += ".splice("+element+",0,newPage)"
			}
			else{
				patron += '['+element+'].childs';
			}
		});

		eval(patron);
		res.send(sitemap);
	});

	//FALTA DEFINIR LOS PARAMETROS DE EDICION
	app.post('/page/edit/:id', function (req, res) {
		
		var id = req.params.id,
			name = req.body.name,
			sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json')),
			editedPage = findPage(sitemap.pages,id),
			index = findIndex(sitemap.pages,id);

		editedPage['name'] = name;

		var position = req.body.position || '';
		var patron = "sitemap.pages";

		index.forEach(function(element,i){
			if(i == 0){
				patron += '['+element+']'
			}
			else{
				patron += '.childs['+element+']';
			}
		})

		eval(patron +'= editedPage');

		if(position != ''){

			var patronDelete = "sitemap.pages",
				patronEdit = "sitemap.pages",
				currentPage;
			//Primero borramos el elemento de su posicion actual
			index.forEach(function(element,i){
				if(i == (index.length - 1)){
					patronDelete += ".splice("+element+",1)"
				}
				else{
					patronDelete += '['+element+'].childs';
				}
			})

			currentPage = eval(patronDelete);

			//Copiamos el elemento en su nueva posicion
			position.forEach(function(element,i){

				if(i == (position.length - 1)){
					patronEdit += ".splice("+element+",0,currentPage[0])"
				}
				else{
					patronEdit += '['+element+'].childs';
				}
			});

			eval(patronEdit);
		}	

		res.send(sitemap);
	});

	//TERMINADO A FALTA DE GUARDAR EN EL FICHERO FINAL
	app.post('/page/delete/:id', function (req, res) {
		
		var id = req.params.id,
			sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json')),
			index = findIndex(sitemap.pages,id);

		var patron = "sitemap.pages";
			
		index.forEach(function(element,i){
			if(i == (index.length - 1)){
				patron += ".splice("+element+",1)"
			}
			else{
				patron += '['+element+'].childs';
			}
		})
		eval(patron);
		res.send(sitemap);
	});

	app.post('/page/:idPage/component/add', function (req, res) {
		//Configuracion de colocacion
		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var layoutColumnPosition = req.body.layoutColumnPosition || 0;

		//Datos del componente
		var componentName = req.body.name || 'Component';
		var componentId = req.body.id || '';
		var componentContent = req.body.content || '';
		var componentTitle = req.body.title || componentName;
		var componentShowTitle = req.body.showTitle || 'true';
		var componentFull = req.body.full || 'false';
		var componentClasses = req.body.classes || '';

		var newComponent = {
			"name":componentName,
			"id":componentId,
			"content":componentContent,
			"title":componentTitle,
			"showTitle":componentShowTitle,
			"full":componentFull,
			"classes":componentClasses
		}

		var sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json'));
		var editedPage = findPage(sitemap.pages,idPage);
		var index = findIndex(sitemap.pages,idPage);

		editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,0,newComponent);

		var patron = "sitemap.pages";

		//Generamos la posicion de edicion
		index.forEach(function(element,i){
			if(i == 0){
				patron += '['+element+']'
			}
			else{
				patron += '.childs['+element+']';
			}
		})

		eval(patron +'= editedPage');
		res.send(sitemap);

	});

	app.post('/page/:idPage/component/edit', function (req, res) {

		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var layoutColumnPosition = req.body.layoutColumnPosition || 0;

		//Datos del componente
		var componentName = req.body.name || 'Component';
		var componentId = req.body.id || '';
		var componentContent = req.body.content || '';
		var componentTitle = req.body.title || componentName;
		var componentShowTitle = req.body.showTitle || 'true';
		var componentFull = req.body.full || 'false';
		var componentClasses = req.body.classes || '';

		var newComponent = {
			"name":componentName,
			"id":componentId,
			"content":componentContent,
			"title":componentTitle,
			"showTitle":componentShowTitle,
			"full":componentFull,
			"classes":componentClasses
		}

		var sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json'));
		var editedPage = findPage(sitemap.pages,idPage);
		var index = findIndex(sitemap.pages,idPage);

		editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,1);
		editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,0,newComponent);

		//Generamos la posicion de edicion
		var patron = "sitemap.pages";
		index.forEach(function(element,i){
			if(i == 0){
				patron += '['+element+']'
			}
			else{
				patron += '.childs['+element+']';
			}
		})

		eval(patron +'= editedPage');
		res.send(sitemap);
	});

	app.post('/page/:idPage/component/delete', function (req, res) {
		//Configuracion de colocacion
		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var componentPosition = req.body.componentPosition || '';

		var sitemap = JSON.parse(fs.readFileSync(pathBundles + '/sites/default/sitemap.json'));
		var editedPage = findPage(sitemap.pages,idPage);
		var index = findIndex(sitemap.pages,idPage);
		var patron = "sitemap.pages";

		editedPage.layout.content[layoutColumn].splice(componentPosition,1);

		//Generamos la posicion de edicion
		index.forEach(function(element,i){
			if(i == 0){
				patron += '['+element+']'
			}
			else{
				patron += '.childs['+element+']';
			}
		})

		eval(patron +'= editedPage');
		res.send(sitemap);
	});



	app.listen(8082,function(req, res){
  		console.log('API running on 8082!');
	});

});



function findPage(pages , id){
	//var page = pages.filter(page => page.id == id)[0];

	var page = '';
	for( var i=0; i<pages.length; i++) {
		if(pages[i].childs.length > 0){
			page = findPage(pages[i].childs , id);
		}

		if(page != '' && page !== undefined){
			return page;
		}

		else if(pages[i].id == id){
			return pages[i];
		}
	};
}

function findIndex(pages , id){
	//var page = pages.filter(page => page.id == id)[0];

	var index = [];
	for( var i=0; i<pages.length; i++) {
		if(pages[i].childs.length > 0){
			index = findIndex(pages[i].childs , id);
		}

		if(index != '' && index !== undefined){
			return [i].concat(index);
		}

		else if(pages[i].id == id){
			return [i];
		}
	};
}