var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs'),
	path = require('path');


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
		var siteURL = pathBundles + '/sites/default';
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
		var position = [req.body.position] || [sitemap.pages.length] ;
		var patron = "sitemap.pages";

		var name = req.body.name,
			id = normaliza(name) + '-' + parseInt(Math.random() * (9999 - 0) + 0),
			url = req.body.url || '/' + name,
			src = "/" + normaliza(name) + '.html',
			title = req.body.title || name,
			description = req.body.description || '',
			keywords = req.body.keywords || '',
			layout = req.body.layout || '';

		var columns = getLayoutColumns(layout);
		var pageColumns = {};

		columns.forEach(function(element){
			pageColumns[element]=[];
		});

		var newPage = {
			"id":id,
			"name": name,
			"url": url.indexOf('/') < 0 || url.indexOf('/') > 0 ? "/" + url : url,
			"src": src,
			"attributes":{
				"title":title,
				"description":description,
				"keywords":keywords
			},
			"layout":{
				"name":layout.split('.')[0],
				"content": pageColumns
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

		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

		deployPage('--site default --page ' + src.split('.')[0].split('/')[1] , res)
	});

	//FALTA DEFINIR LOS PARAMETROS DE EDICION
	app.post('/page/edit/:id', function (req, res) {
		var siteURL = pathBundles + '/sites/default';
		var id = req.params.id,
			sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json')),
			editedPage = findPage(sitemap.pages,id),
			index = findIndex(sitemap.pages,id),
			name = req.body.name,
			url = req.body.url || '/' + name,
			title = req.body.title || name,
			description = req.body.description || '',
			keywords = req.body.keywords || '',
			layout = req.body.layout || '',
			position = [req.body.position] || [sitemap.pages.length];

		editedPage['name'] = name;
		editedPage['url'] = url;
		editedPage.attributes['title'] = title;
		editedPage.attributes['description'] = description;
		editedPage.attributes['keywords'] = keywords;

		//Comprobamos si la layout ha cambiado
		if(editedPage.layout['name'] != layout.split('.')[0]){

			var columns = getLayoutColumns(layout);
			var pageColumns = {};
			var components = [];

			Object.keys(editedPage.layout['content']).forEach(function(key){
				components = components.concat(editedPage.layout['content'][key]);
			});

			columns.forEach(function(element){
				pageColumns[element]=[];
			});

			pageColumns[Object.keys(pageColumns)[0]]=components;
			editedPage.layout['name'] = layout.split('.')[0];
			editedPage.layout['content'] = pageColumns;
		}

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

		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

		deployPage('--site default --page ' + editedPage['src'].split('.')[0].split('/')[1] , res)
	});

	//TERMINADO A FALTA DE GUARDAR EN EL FICHERO FINAL
	app.post('/page/delete/:id', function (req, res) {
		var siteURL = pathBundles + '/sites/default';
		var id = req.params.id,
			sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json')),
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

		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
		deploySites('--site default' , res);
	});

	app.get('/page/detail/:id', function (req, res) {
		var idPage = req.params.id;
		var siteURL = pathBundles + '/sites/default';
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
		var detailPage = findPage(sitemap.pages,idPage);
		var positionPage = findIndex(sitemap.pages,idPage);

		detailPage['position'] = positionPage[positionPage.length - 1]

		res.send(detailPage);
	});		

	app.post('/page/:idPage/component/add', function (req, res) {
		//Configuracion de colocacion
		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var layoutColumnPosition = req.body.layoutColumnPosition || 0;
		var siteURL = pathBundles + '/sites/default';
		//Datos del componente
		var componentName = req.body.name || 'Component';
		var componentId = normaliza(componentName) + '-' + parseInt(Math.random() * (9999 - 0) + 0);
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

		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
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
		
		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
		deploySites('--site default' , res);

	});

	app.post('/page/:idPage/component/edit', function (req, res) {

		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var layoutColumnPosition = req.body.layoutColumnPosition || 0;
		var oldPosition = req.body.oldPosition;
		var oldlLayoutColumn = req.body.oldLayoutColumn;

		//Datos del componente
		var componentName = req.body.name || 'Component';
		var componentContent = req.body.content || '';
		var componentTitle = req.body.title || componentName;
		var componentShowTitle = req.body.showTitle || 'true';
		var componentFull = req.body.full || 'false';
		var componentClasses = req.body.classes || '';
		var siteURL = pathBundles + '/sites/default';
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
		var editedPage = findPage(sitemap.pages,idPage);
		var index = findIndex(sitemap.pages,idPage);

		editedPage.layout.content[oldlLayoutColumn][oldPosition].name = componentName;
		editedPage.layout.content[oldlLayoutColumn][oldPosition].content = componentContent;
		editedPage.layout.content[oldlLayoutColumn][oldPosition].title = componentTitle;
		editedPage.layout.content[oldlLayoutColumn][oldPosition].showTitle = componentShowTitle;
		editedPage.layout.content[oldlLayoutColumn][oldPosition].full = componentFull;
		editedPage.layout.content[oldlLayoutColumn][oldPosition].classes = componentClasses;

		editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,0,editedPage.layout.content[oldlLayoutColumn][oldPosition])
		editedPage.layout.content[oldlLayoutColumn].splice(oldPosition,1);
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
		
		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
		deploySites('--site default' , res);
	});

	app.post('/page/:idPage/component/delete', function (req, res) {
		//Configuracion de colocacion
		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn || '';
		var componentPosition = req.body.componentPosition || '';
		var siteURL = pathBundles + '/sites/default';

		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
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
		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
		deploySites('--site default' , res,{"column":layoutColumn,"position":componentPosition});
	});

	app.listen(8082,function(req, res){
  		console.log('API running on 8082!');
	});


	app.get('/layout/list', function (req, res) {
		var dirLayoutsBundles = fs.readdirSync('./app/bundles/src/layouts/');
		var dirLayoutsPlugins = fs.readdirSync('./app/plugins/layouts/');

		res.send(dirLayoutsBundles.concat(dirLayoutsPlugins));
	});

	app.get('/layout/detail/:id', function (req, res) {
		var idLayout = req.params.id;
		var columns = getLayoutColumns(idLayout);
		var responseParams = {"columns": columns};

		res.send(responseParams);
	});	

	app.get('/component/list', function (req, res) {
		var dirComponentsBundles = getDirectories(pathBundles + '/components/');
		var dirComponentsPlugins = getDirectories(pathPlugins + '/components/');

		res.send(dirComponentsBundles.concat(dirComponentsPlugins));
	});

	app.post('/page/:idPage/component/detail', function (req, res) {

		var idPage = req.params.idPage || '';
		var layoutColumn = req.body.layoutColumn;
		var componentPosition = parseInt(req.body.componentPosition);
		var siteURL = pathBundles + '/sites/default';
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
		var editedPage = findPage(sitemap.pages,idPage);

		editedPage.layout.content[layoutColumn][componentPosition].position = componentPosition;
		editedPage.layout.content[layoutColumn][componentPosition].layoutColumn = layoutColumn;
		editedPage.layout.content[layoutColumn][componentPosition] = Object.assign(editedPage.layout.content[layoutColumn][componentPosition],getComponentConfig(editedPage.layout.content[layoutColumn][componentPosition].name));
		res.status(200).send(editedPage.layout.content[layoutColumn][componentPosition]);
	});

	app.get('/component/config/:idComponent', function (req, res) {

		var idComponent = req.params.idComponent;
		var config = getComponentConfig(idComponent);
		console.log(config);
		res.status(200).send(config);
	});


});

function getLayoutColumns(id){
	id = id.split('.pug')[0];
	var filePath = '';
	if(fs.existsSync(pathBundles + '/layouts/' + id + '.pug')){
		filePath = pathBundles + '/layouts/' + id + '.pug';
	}

	if(fs.existsSync(pathPlugins + '/layouts/' + id + '.pug')){
		filePath = pathPlugins + '/layouts/' + id + '.pug';
	}

	try{
		if(filepath != ''){
			var blocks = [];
			var file = fs.readFileSync(filePath).toString();
			file = file.split('data-layout-column="');
			file.forEach(function(element,index){
				if(index>0){
					var slots = element.split('"');
					blocks.push(slots[0]);
				}
			})
			return blocks;
		}
		else{
			return 'La layout no existe';
		}
	}
	catch(e){
		console.log(e);
	}
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

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

function deployPage(argv,res){
	const { exec } = require('child_process');
	console.log('START DEPLOY gulp deploy ' + argv);
	exec('gulp deploy ' + argv, (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('DEPLOY ERROR');
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('DEPLOY FINISHED');
	  res.status(200).send('SUCCESSFULL');
	});
}

function deploySites(argv,res,argv_res){
	const { exec } = require('child_process');
	console.log('START DEPLOY SITES gulp deploy ' + argv);
	exec('gulp deploySites ' + argv, (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('DEPLOY ERROR');
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('DEPLOY FINISHED');
	  res.status(200).send(argv_res);
	});
}

function normaliza(str) {
 	str = str.replace(/^\s+|\s+$/g, ''); // trim
  	str = str.toLowerCase();
 
  	// remove accents, swap ñ for n, etc
  	var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  	var to   = "aaaaaeeeeeiiiiooooouuuunc------";
  	for (var i=0, l=from.length ; i<l ; i++) {
    	str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  	}
 
  	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    	.replace(/\s+/g, '-') // collapse whitespace and replace by -
    	.replace(/-+/g, '-'); // collapse dashes
 

    if(str.substr(str.length -1,str.length) == '-'){
    	str = str.substr(0,str.length -1)
    }	

  	return str;
};

function getComponentConfig(idComponent){

	var config = {};

	if(fs.existsSync(pathBundles + '/components/'+idComponent+'/config.json')){
		config = JSON.parse(fs.readFileSync(pathBundles + '/components/'+idComponent+'/config.json'));
	}
	
	if(fs.existsSync(pathPlugins + '/components/'+idComponent+'/config.json')){
		config = JSON.parse(fs.readFileSync(pathPlugins + '/components/'+idComponent+'/config.json'));
	}	
		
	return config;
}

function getURLSite(site){
	
	if(site == defaultSite){
		return pathBundles + '/sites/' + site;
	}
	else{
		return pathPlugins + '/sites/' + site;
	}

}