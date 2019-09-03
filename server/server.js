var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	rimraf = require("rimraf"),
	pug = require("pug"),
	fsextra = require("fs-extra"),
	html2pug = require('html2pug');

var defaultSite = 'default';


require('dotenv').config();
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const bodyParser = require('body-parser');

const projectId = 'botijo-ad784';
// A unique identifier for the given session
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: './server/credentials.json'
});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);



/** API SERVER **/
gulp.task('apiServer', function() {
	
	app = express();
	var router = express.Router();

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.use(function(req, res, next) {

		var whiteList = ["http://localhost:8080","https://localhost:8080","http://localhost:8081","http://localhost:8083","https://localhost:8083"]

  		var origin = req.headers.origin;
		if (whiteList.indexOf(origin) > -1) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		}
    	res.setHeader("Access-Control-Allow-Credentials", "true");
    	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization,Accept-Language");
		next();
	});

	//FALTA DEFINIR LOS PARAMETROS DE CREACION
	app.post('/site/:idSite/page/add', function (req, res) {

		try{
			var site = req.params.idSite;
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var position = [req.body.position] || [sitemap.pages.length];
			var parentPosition =  req.body.parentPosition !== undefined && req.body.parentPosition != '' ? req.body.parentPosition.split(',') : [];
			var patron = "sitemap.pages";

			var name = req.body.name,
				id = normaliza(name) + '-' + parseInt(Math.random() * (9999 - 0) + 0),
				url = req.body.url || '/' + name,
				src = "/" + normaliza(name) + '.html',
				title = req.body.title || name,
				description = req.body.description || '',
				keywords = req.body.keywords || '',
				layout = req.body.layout || '',
				hidden = req.body.hidden || '';

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
				"hidden":hidden,
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

			position = parentPosition.concat(position);

			position.forEach(function(element,i){
				if(i == (position.length - 1)){
					patron += ".splice("+parseInt(element)+",0,newPage)"
				}
				else{
					patron += '['+parseInt(element)+'].childs';
				}
			});
			console.log(patron);
			eval(patron);

			fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

			deploySites('--site '+ site +' --env dev --pag ' + id , res)
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"ADD_PAGE_ERROR"
				}
			)
		};
	});

	//FALTA DEFINIR LOS PARAMETROS DE EDICION
	app.post('/site/:idSite/page/edit/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = getURLSite(site);
			var id = req.params.id,
				sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json')),
				editedPage = findPage(sitemap.pages,id),
				index = findIndex(sitemap.pages,id),
				name = req.body.name,
				url = req.body.url || '/' + name,
				title = req.body.title || name,
				hidden = req.body.hidden || '',
				description = req.body.description || '',
				keywords = req.body.keywords || '',
				layout = req.body.layout || '',
				parentPosition =  req.body.parentPosition !== undefined && req.body.parentPosition != '' ? req.body.parentPosition.split(',') : [];
				position = [req.body.position] || [sitemap.pages.length] ;

			
			editedPage['name'] = name;
			editedPage['url'] = url;
			editedPage['hidden'] = hidden;
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
				position = parentPosition.concat(position);

				index.forEach(function(element,i){
					if(position[i] > element){
						position[i] = position[i] - 1;
					}
				});

				position.forEach(function(element,i){

					if(i == (position.length - 1)){
						patronEdit += ".splice("+parseInt(element)+",0,currentPage[0])"
					}
					else{
						patronEdit += '['+parseInt(element)+'].childs';
					}
				});
				console.log(patronEdit);
				eval(patronEdit);
			}

			fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

			deployPage('--site '+ site +' --env dev --pag ' + editedPage['id'], res)
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"EDIT_PAGE_ERROR"
				}
			)
		};	
	});

	//TERMINADO A FALTA DE GUARDAR EN EL FICHERO FINAL
	app.post('/site/:idSite/page/delete/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = getURLSite(site);
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
			deploySites('--env dev --site ' + site , res);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"DELETE_PAGE_ERROR"
				}
			)
		};	
	});

	app.get('/site/:idSite/page/detail/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.id;
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var detailPage = findPage(sitemap.pages,idPage);
			var positionPage = findIndex(sitemap.pages,idPage);
			detailPage['position'] = positionPage.pop();
			detailPage['parentPosition'] = positionPage.join();
			res.send(detailPage);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"DETAIL_PAGE_ERROR"
				}
			)
		};	
	});	

	app.post('/site/:idSite/page/:idPage/publish', function (req, res) {
		try{
			var site = req.params.idSite;
			var page = req.params.idPage;
			deployPage('--site ' + site + ' --pag '+ page , res);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"PUBLISH_PAGE_ERROR"
				}
			)
		};			
	});

	app.get('/site/:idSite/page/list', function (req, res) {
			var site = req.params.idSite;
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));

			res.status(200).send(pagesList(sitemap.pages,sitemap.pages));
			
	});			

	app.post('/site/:idSite/page/:idPage/component/add', function (req, res) {
		//Configuracion de colocacion
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var layoutColumnPosition = req.body.layoutColumnPosition || 0;
			var siteURL = getURLSite(site);
			//Datos del componente
			var componentName = req.body.name || 'Component';
			var componentId = normaliza(componentName) + '-' + parseInt(Math.random() * (9999 - 0) + 0);
			var componentContent = req.body.content || {};
			var componentTitle = req.body.title || componentName;
			var componentShowTitle = req.body.showTitle || 'true';
			var componentFull = req.body.full || 'false';
			var componentClasses = req.body.classes || '';
			var componentNew = req.body.newComponent || 'false';



			var configComponent = getComponentConfig(componentName);	

			componentContent = buildDefaultComponentData(configComponent.config, componentContent)

			var newComponent = {
				"name":componentName,
				"id":componentId,
				"content":componentContent,
				"title":componentTitle,
				"showTitle":componentShowTitle,
				"full":componentFull,
				"classes":componentClasses,
				"new":componentNew
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
			deployPage('--env dev --site ' + site + ' --pag ' + editedPage['id'], res);
		}
		catch(e){
			res.status(200).send(
				{"error":
					{
						"code":"412",
						"statusCode":"ADD_COMPONENT_ERROR"
					}
				}
			);
		}		

	});

	app.post('/site/:idSite/page/:idPage/component/edit', function (req, res) {
		try{
			var site = req.params.idSite;
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
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = findPage(sitemap.pages,idPage);
			var index = findIndex(sitemap.pages,idPage);

			editedPage.layout.content[oldlLayoutColumn][oldPosition].name = componentName;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].content = componentContent;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].title = componentTitle;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].showTitle = componentShowTitle;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].full = componentFull;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].classes = componentClasses;
			editedPage.layout.content[oldlLayoutColumn][oldPosition].new = 'false';


			if((oldPosition > layoutColumnPosition) || (oldlLayoutColumn != layoutColumn ) ){
				editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,0,editedPage.layout.content[oldlLayoutColumn][oldPosition]);
			}
			else{
				editedPage.layout.content[layoutColumn].splice(parseInt(layoutColumnPosition) + 1,0,editedPage.layout.content[oldlLayoutColumn][oldPosition]);
			}


			if((oldPosition > layoutColumnPosition) && (oldlLayoutColumn == layoutColumn)){
				editedPage.layout.content[oldlLayoutColumn].splice(parseInt(oldPosition) + 1,1);
			}
			else{
				editedPage.layout.content[oldlLayoutColumn].splice(oldPosition,1);
			}	
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
			deployPage('--env dev --site ' + site + ' --pag ' + editedPage['id'] , res);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"EDIT_COMPONENT_ERROR"
				}
			)
		};	
	});

	app.post('/site/:idSite/page/:idPage/component/delete', function (req, res) {
		try{
			//Configuracion de colocacion
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var componentPosition = req.body.componentPosition || '';
			var siteURL = getURLSite(site);

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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['id'] , res,{"column":layoutColumn,"position":componentPosition});
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"DELETE_COMPONENT_ERROR"
				}
			)
		};	
	});

	app.post('/site/:idSite/page/:idPage/component/move', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var layoutColumnPosition = req.body.layoutColumnPosition || 0;
			var oldPosition = req.body.oldPosition;
			var oldlLayoutColumn = req.body.oldLayoutColumn;

			//Datos del componente
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = findPage(sitemap.pages,idPage);
			var index = findIndex(sitemap.pages,idPage);

			if((oldPosition > layoutColumnPosition) || (oldlLayoutColumn != layoutColumn ) ){
				editedPage.layout.content[layoutColumn].splice(layoutColumnPosition,0,editedPage.layout.content[oldlLayoutColumn][oldPosition]);
			}
			else{
				editedPage.layout.content[layoutColumn].splice(parseInt(layoutColumnPosition) + 1,0,editedPage.layout.content[oldlLayoutColumn][oldPosition]);
			}


			if((oldPosition > layoutColumnPosition) && (oldlLayoutColumn == layoutColumn)){
				editedPage.layout.content[oldlLayoutColumn].splice(parseInt(oldPosition) + 1,1);
			}
			else{
				editedPage.layout.content[oldlLayoutColumn].splice(oldPosition,1);
			}	
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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['id'], res);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"MOVE_COMPONENT_ERROR"
				}
			)
		};			
	});


	app.post('/site/:id/component/create', function (req, res) {
		try{
			var componentName = req.body.name;
			var componentConfig = req.body.config[0].name != '' ? {"config":req.body.config} : JSON.parse('{"config":[]}');
			var componentView = req.body.componentView || 'div';
			var componentJS = req.body.componentJS || '';
			var componentCSS = req.body.componentCSS || '';

			if(fs.existsSync(pathPlugins + '/components/component-' + componentName)){
				res.status(412).send({
					"code":"412",
					"statusCode":"COMPONENT_CREATE_ERROR_NAME_IN_USE"
				})
			}

			//Se hace una donble conversion para compobar algunos errores de formato, si da error lo capturara el try catch
			var componentViewCheck = pug.render(componentView, {});
			componentViewCheck = html2pug(componentViewCheck, { tabs: true, fragment:true})
			
			fs.mkdirSync(pathPlugins + '/components/component-' + componentName);

			var view = "mixin component-"+componentName+"(content)\n";
			
			componentView.split('\n').forEach(function(line){
				line = line.replace(/\s+$/,"");
				view += "\t" + line + "\n";
			});

			var include="";
			//añadir al include o crearlo
			if(fs.existsSync(pathPlugins + '/components/include_components.pug')){
				include = fs.readFileSync(pathPlugins + '/components/include_components.pug').toString() + '\n';
			}
			else{
				include = fs.readFileSync(pathBundles + '/components/include_components.pug').toString() + '\n';
			}

			var config={};
			//añadir al include o crearlo
			if(!fs.existsSync(pathPlugins + '/components/config.json')){
				config = JSON.parse(fs.readFileSync(pathBundles + '/components/config.json'));
			}
			else{
				config = JSON.parse(fs.readFileSync(pathPlugins + '/components/config.json'));
			}

			include += "include ../components/component-"+componentName+"/view.pug";
			
			fs.writeFileSync(pathPlugins + '/components/config.json',JSON.stringify(config,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/components/include_components.pug',include,function(err){});
			fs.writeFileSync(pathPlugins + '/components/component-'+componentName+'/view.pug',view,function(err){});
			fs.writeFileSync(pathPlugins + '/components/component-'+componentName+'/config.json', JSON.stringify(componentConfig,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/components/component-'+componentName+'/main.scss', componentCSS ,function(err){});
			fs.writeFileSync(pathPlugins + '/components/component-'+componentName+'/main.js', componentJS ,function(err){});
			
			res.status(200).send();
		
		}
		catch(e){
			console.log(e);
			//Si ocurre algun error borramos la carpeta del componente si existe	
			if(fs.existsSync(pathPlugins + '/components/component-' + componentName)){
				rimraf(pathPlugins + '/components/component-' + componentName,function () {
					res.status(200).send();
				});				
			}
			//Si ocurre algun error borramos la referencia al componente
			if(fs.existsSync(pathPlugins + '/components/include_components.pug')){
				var include = fs.readFileSync(pathPlugins + '/components/include_components.pug').toString() + '\n';
				include = include.replace("include ../components/component-"+componentName+"/view.pug","");
				fs.writeFileSync(pathPlugins + '/components/include_components.pug',include,function(err){});
			};

			res.status(200).send(
				{
					"error":{
						"code":"412",
						"statusCode":"COMPONENT_CREATE_ERROR"
					}
				}
			)
		};

	});

	app.post('/site/:id/component/edit-created', function (req, res) {
		try{
			var componentName = req.body.name;
			var componentConfig = {"config":req.body.config} || JSON.parse('{"config":[]}');
			var componentView = req.body.componentView || 'div';
			var componentJS = req.body.componentJS || '';
			var componentCSS = req.body.componentCSS || '';

			if(!fs.existsSync(pathPlugins + '/components/' + componentName)){
				res.status(412).send({
					"code":"412",
					"statusCode":"COMPONENT_EDIT_ERROR_NOT_EXISTS"
				})
			}

			//Se hace una donble conversion para compobar algunos errores de formato, si da error lo capturara el try catch
			var componentViewCheck = pug.render(componentView, {});
			componentViewCheck = html2pug(componentViewCheck, { tabs: true, fragment:true})	

			var view ="";

			console.log(componentView);

			componentView.split('\n').forEach(function(line){
				line = line.replace(/\s+$/,"");
				view += line + "\n";
			});

			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/view.pug',view,function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/config.json', JSON.stringify(componentConfig,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/main.scss', componentCSS ,function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/main.js', componentJS ,function(err){});
			
			execGulpTask('gulp deploy --env dev & gulp removeTMP', res);
		
		}
		catch(e){
			//Si ocurre algun error borramos la carpeta del componente si existe	
			if(fs.existsSync(pathPlugins + '/components/component-' + componentName)){
				rimraf(pathPlugins + '/components/component-' + componentName,function () {
					res.status(200).send();
				});				
			}
			//Si ocurre algun error borramos la referencia al componente
			if(fs.existsSync(pathPlugins + '/components/include_components.pug')){
				var include = fs.readFileSync(pathPlugins + '/components/include_components.pug').toString() + '\n';
				include = include.replace("include ../components/component-"+componentName+"/view.pug","");
				fs.writeFileSync(pathPlugins + '/components/include_components.pug',include,function(err){});
			};

			res.status(200).send(
				{
					"error":{
						"code":"412",
						"statusCode":"COMPONENT_EDIT_ERROR"
					}
				}
			)
		};
	});

	app.get('/site/:id/component/detail-created/:componentName', function (req, res) {
		var componentName = req.params.componentName;
		var content = getComponentConfig(componentName);
		var config = getComponentsGeneralConfig();
		var componentView = fs.readFileSync(pathPlugins + '/components/'+componentName+'/view.pug').toString();
		var componentCSS = fs.readFileSync(pathPlugins + '/components/'+componentName+'/main.scss').toString();
		var componentJS = fs.readFileSync(pathPlugins + '/components/'+componentName+'/main.js').toString();

		res.status(200).send(Object.assign({"name":componentName,"componentView":componentView,"componentCSS":componentCSS,"componentJS":componentJS},config,{"content":content}));

	});

	app.post('/site/:id/component/delete-created', function (req, res) {

		var componentName = req.body.name;

		if(fs.existsSync(pathPlugins + '/components/' + componentName)){

			if(!componentInUse(componentName)){

				var includeComponents = fs.readFileSync(pathPlugins + '/components/include_components.pug').toString();
				includeComponents = includeComponents.replace('include ../components/'+componentName+'/view.pug','');
				fs.writeFileSync(pathPlugins + '/components/include_components.pug', includeComponents,function(err){});

				rimraf(pathPlugins + '/components/' + componentName,function () {
					console.log("ELIMINADO COMPONENTE -> " + componentName);
					res.status(200).send();
				});

			}else{
				res.status(412).send({
					"code":"412",
					"statusCode":"COMPONENT_DELETE_ERROR_IN_USE"
				})				
			}
		}
		else{
			res.status(412).send({
				"code":"412",
				"statusCode":"COMPONENT_DELETE_ERROR_NOT_EXIST"
			})			
		}

	});


	app.get('/site/:id/component/generalConfig', function (req, res) {
		var config = getComponentsGeneralConfig();
		return res.status(200).send(config);
		
	});		

	app.listen(8082,function(req, res){
  		console.log('API running on 8082!');
	});


	app.get('/layout/list', function (req, res) {
		try{
			var dirLayoutsBundles = fs.readdirSync('./app/bundles/src/layouts/');
			var dirLayoutsPlugins = fs.readdirSync('./app/plugins/layouts/');
			res.send(dirLayoutsBundles.concat(dirLayoutsPlugins));
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"LAYOUT_LIST_ERROR"
				}
			)
		};			
	});

	app.get('/layout/detail/:id', function (req, res) {
		try{
			var idLayout = req.params.id;
			var columns = getLayoutColumns(idLayout);
			var responseParams = {"columns": columns};
			res.send(responseParams);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"LAYOUT_DETAIL_ERROR"
				}
			)
		};			
	});	

	app.get('/component/list', function (req, res) {
		try{
			var dirComponentsBundles = getDirectories(pathBundles + '/components/');
			var dirComponentsPlugins = getDirectories(pathPlugins + '/components/');
			res.send(dirComponentsBundles.concat(dirComponentsPlugins));
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_LIST_ERROR"
				}
			)
		};			
	});

	app.get('/component/list/detail', function (req, res) {
		try{
			var dirComponentsBundles = getDirectories(pathBundles + '/components/');
			var dirComponentsPlugins = getDirectories(pathPlugins + '/components/');
			
			var components = []

			dirComponentsBundles.forEach(function(component){
				components.push({"name":component,"editable":"false"});
			});

			dirComponentsPlugins.forEach(function(component){
				components.push({"name":component,"editable":"true"});
			});

			res.send(components);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_LIST_ERROR"
				}
			)
		};			
	});	

	app.post('/site/:idSite/page/:idPage/component/detail', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn;
			var componentPosition = parseInt(req.body.componentPosition);
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = findPage(sitemap.pages,idPage);

			editedPage.layout.content[layoutColumn][componentPosition].position = componentPosition;
			editedPage.layout.content[layoutColumn][componentPosition].layoutColumn = layoutColumn;
			editedPage.layout.content[layoutColumn][componentPosition] = Object.assign(editedPage.layout.content[layoutColumn][componentPosition],getComponentConfig(editedPage.layout.content[layoutColumn][componentPosition].name));
			res.status(200).send(editedPage.layout.content[layoutColumn][componentPosition]);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_DETAIL_ERROR"
				}
			)
		};			
	});

	app.get('/theme/list', function (req, res) {
		try{
			var dirThemesBundles = getDirectories(pathBundles + '/themes/');
			var dirThemesPlugins = getDirectories(pathPlugins + '/themes/');
			res.send(dirThemesBundles.concat(dirThemesPlugins));
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"THEME_LIST_ERROR"
				}
			)
		};			
	});

	app.get('/component/config/:idComponent', function (req, res) {
		try{
			var idComponent = req.params.idComponent;
			var config = getComponentConfig(idComponent);
			res.status(200).send(config);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_CONFIG_ERROR"
				}
			)
		};			
	});

	app.post('/site/:idSite/publish', function (req, res) {
		try{
			var site = req.params.idSite;
			deployPage('--site ' + site  , res);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"PUBLISH_SITE_ERROR"
				}
			)
		};			
	});

	app.get('/site/list', function (req, res) {
		try{
			var dirSitesBundles = fs.readdirSync('./app/bundles/src/sites/');
			var dirSitesPlugins = fs.readdirSync('./app/plugins/sites/');

			var dirSites = dirSitesBundles.concat(dirSitesPlugins);
			var sites = [];

			dirSites.forEach(function(element,index){
				var siteURL = getURLSite(element);
				var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
				sites.push({'name':element,'url':sitemap.site.url});
			});	

			res.send(sites);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_LIST_ERROR"
				}
			)
		};			
	});	

	app.post('/site/add', function (req, res) {
		try{
			var siteName = req.body.name;
			var siteURL = req.body.url;
			var enableChatBot = req.body.enableChatBot;
			var siteTheme = {"theme": req.body.theme};
			var defaultSiteURL = getURLSite(defaultSite);

			if(siteURL[0]!= '/'){
				siteURL= '/' + siteURL;
			}

			var sitemap = {
				"site":{
					"name": siteName,
					"url": siteURL,
					"enableChatBot":enableChatBot
				},
				"pages": [
					{
						"id": "home",
			            "name": "Home",
			            "url": "/",
			            "src": "/home.html",
			            "attributes": {
			                "title": "SunnieJS3",
			                "description": "Lorem ipsum4",
			                "keywords": "SunnieJS2"
			            },
			            "layout": {
			                "name": "layout-12-fluid",
			                "content": {
			                    "content_upper": [
			                        {
			                            "id": "1",
			                            "name": "component-sample",
			                            "content": "Lorem ipsum dolor sit amet",
			                            "showTitle": "false",
			                            "full": "true"
			                        }
			                    ]
			                }
			            },
			            "childs": []
					}
				]
			};	
			fs.mkdirSync(pathPlugins + '/sites/' + siteName);
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/build.json', JSON.stringify(siteTheme,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/sitemap.json', JSON.stringify(sitemap,null,4),function(err){});
			fsextra.copy(defaultSiteURL + '/locale/', pathPlugins + '/sites/' + siteName+'/locale/',function(err){});
			fsextra.copy(defaultSiteURL + '/content_manager/', pathPlugins + '/sites/' + siteName+'/content_manager/',function(err){});

			deployPage('--env dev --site ' + siteName , res);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"ADD_SITE_ERROR"
				}
			)
		};			
	});

	app.get('/site/detail/:id', function (req, res) {
		try{
			var site = req.params.id;
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));		
			var build = JSON.parse(fs.readFileSync(siteURL + '/build.json'));	
			res.status(200).send(Object.assign(sitemap.site, build));
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_DETAIL_ERROR"
				}
			)
		};		
	});

	app.post('/site/edit/:id', function (req, res) {
		try{
			var site = req.params.id;
			var name = req.body.name;
			var enableChatBot = req.body.enableChatBot;
			var url = req.body.url;
			var theme = req.body.theme;

			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var build = JSON.parse(fs.readFileSync(siteURL + '/build.json'));
			var oldUrl = sitemap.site.url;

			sitemap.site.name = name;
			sitemap.site.url = url;
			sitemap.site.enableChatBot = enableChatBot;
			build.theme = theme;

			fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
			fs.writeFileSync(siteURL + '/build.json', JSON.stringify(build,null,4));

			//Renombro los archivos del site en src. Se encadenan para que no se bloqueen entre ellas
			fs.rename(siteURL + '/locale/es/' + site + '.json', siteURL + '/locale/es/' + name + '.json', function(err) {
			    if ( err ) console.log('ERROR: ' + err);
			    else{
					fs.rename(siteURL + '/locale/en/' + site + '.json', siteURL + '/locale/en/' + name + '.json', function(err) {
					    if ( err ) console.log('ERROR: ' + err);
					    else{
							fs.rename(siteURL, siteURL + '/../' + name, function(err) {
							    if ( err ) console.log('ERROR: ' + err);
							});
					    }
					});
			    }
			});
						
			//Renombro la carpeta el site en development
			fs.rename( siteURL + '/../../../../development/sites/' + site, siteURL + '/../../../../development/sites/' + name, function(err) {
			    if ( err ) console.log('ERROR: ' + err);
			});

			deployPage('--env dev --site ' + name , res,{"name":name, "url":url, "oldUrl": oldUrl});
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"EDIT_SITE_ERROR"
				}
			)
		};			
	});

	app.post('/site/delete/:id', function (req, res) {
		try{	
			var site = req.params.id;
			var siteURL = getURLSite(site);

			rimraf(siteURL,function () {
				rimraf(siteURL + '/../../../build/sites/' + site,function () {
					rimraf(siteURL + '/../../../development/sites/' + site,function () {
						rimraf(siteURL + '/../../../public/sites/' + site,function () {
							console.log("ELIMINADO SITE -> " + site);
							res.status(200).send();
						});
					});
				});
			});
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_DELETE_ERROR"
				}
			)
		};			
	});

	app.get('/site/:id/get-locales', function (req, res) {
		try{
			var site = req.params.id;
			var siteURL = getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));

			var langs = ['es','en'];

			var customLocaleJSON, siteLocale = {};


			langs.forEach(function(element,i){


				if(fs.existsSync(siteURL + '/locale/'+ element + '/custom.json')){
					customLocaleJSON = JSON.parse(fs.readFileSync(siteURL + '/locale/'+ element + '/custom.json'));
				}
				else{
					customLocaleJSON = {};
				}

				Object.keys(customLocaleJSON).forEach(function(key){
					if(siteLocale[key] == undefined){
						siteLocale[key] = [];
					}

					siteLocale[key].push({ [element] : customLocaleJSON[key] });
				});

			});

			res.status(200).send(siteLocale);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_LOAD_LOCALE_LIST_ERROR"
				}
			)
		};					
	});


	app.post('/site/:id/update-locales', function (req, res) {

		var site = req.params.id;
		var siteURL = getURLSite(site);
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));

		var locales = req.body.locales;
		
		var langs = ['es','en'];
		
		langs.forEach(function(element,i){

			var customLocaleJSON={};

			locales.forEach(function(el,index){
				customLocaleJSON[el.key] = locales[index][element];
			});

			fs.writeFileSync(siteURL + '/locale/'+ element + '/custom.json', JSON.stringify(customLocaleJSON,null,4),function(err){});	

		});

		deploySites('--env dev --site ' + site, res);
	});


	//SERVICIO CHATBOT
	app.post('/send-message', function (req, res) {
			var message = req.body.message;	
			var maxLength = 0;
		  // The text query request.
		  const request = {
		    session: sessionPath,
		    queryInput: {
		      text: {
		        // The query to send to the dialogflow agent
		        text: message,
		        // The language used by the client (en-US)
		        languageCode: 'es-ES'
		      }
		    }
		  };
		  // Send request and log result

		  console.log('/send-message Invocado');
		  console.log(message);

		  sessionClient.detectIntent(request).then(responses => {
		    const result = responses[0].queryResult;
		    return res.json(result);
		  });
		});

	//CONTENIDOS

	app.get('/site/:id/content/contentTypes', function (req, res) {
		
		var site = req.params.id,
			siteURL = getURLSite(site),
			contentTypes = [];

		if(fs.existsSync(siteURL + '/content_manager')){
			dirContentSite = fs.readdirSync(siteURL + '/content_manager');
		}

		dirContentSite.forEach(function(element,index){
			if(element.split('.').length <= 1){
				contentTypes.push({"value":element,"label":element});
			}	
		});

		return res.status(200).send(contentTypes);

	});

	app.get('/site/:id/content/detail/:contentType/:idContent', function (req, res) {
		
		var site = req.params.id,
			siteURL = getURLSite(site),
			idContent = req.params.idContent,
			contentType = req.params.contentType,
			contentConfig = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
			contentConfigValues = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/' + idContent + '/config.json'));
			configValues = contentConfigValues.configValues;
			contentTypes = [];

		if(fs.existsSync(siteURL + '/content_manager')){
			dirContentSite = fs.readdirSync(siteURL + '/content_manager');
		}

		dirContentSite.forEach(function(element,index){
			if(element.split('.').length <= 1){
				contentTypes.push({"value":element,"label":element});
			}	
		});

		delete contentConfigValues['configValues'];

		return res.status(200).send(Object.assign(contentConfig,contentConfigValues,{"contentTypes":contentTypes},{"content":configValues}));

	});

	app.get('/site/:id/content/detail/:contentType', function (req, res) {
		
		var site = req.params.id,
			siteURL = getURLSite(site),
			contentType = req.params.contentType,
			contentTypeConfig = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
			
		return res.status(200).send(contentTypeConfig);

	});	

	app.get('/site/:id/contents/:idComponent', function (req, res) {
		
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var dirContentSite = [];
		var contents = [];
		var idComponent = req.params.idComponent;
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json').toString());
		var componentDetail = getDetailComponentByID(idComponent, sitemap.pages);

		if(fs.existsSync(siteURL + '/content_manager')){
			dirContentSite = fs.readdirSync(siteURL + '/content_manager');
		}
		
		dirContentSite.forEach(function(contentType,index){

			if(contentType.split('.').length <= 1){
				fs.readdirSync(siteURL + '/content_manager/' + contentType).forEach(function(element,i){

					if(element.split('.').length <= 1 && element != 'empty_content'){
						var file = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/' + element + '/config.json'));
						file['contentType']= contentType;
						file['checked'] = componentDetail.content.idContent == element ? true : false;
						contents.push(file);
					}
				})
			}
		})

		contents = { "content": contents };

		return res.status(200).send(contents);
	});

	app.get('/site/:id/contents', function (req, res) {
		
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var dirContentSite = [];
		var contents = [];

		if(fs.existsSync(siteURL + '/content_manager')){
			dirContentSite = fs.readdirSync(siteURL + '/content_manager');
		}
		
		dirContentSite.forEach(function(contentType,index){

			if(contentType.split('.').length <= 1){
				fs.readdirSync(siteURL + '/content_manager/' + contentType).forEach(function(element,i){

					if(element.split('.').length <= 1 && element != 'empty_content'){
						var file = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/' + element + '/config.json'));
						file['contentType']= contentType;
						contents.push(file);
					}
				})
			}
		})

		contents = { "content": contents };

		return res.status(200).send(contents);
	});

	app.post('/site/:id/content/add', function (req, res) {

		var site = req.params.id;
		var siteURL = getURLSite(site);
		var contentType = req.body.contentType;
		var name = req.body.name;
		var createdDate = new Date().toGMTString();
		var id = 'content_' + parseInt(Math.random() * (99999 - 0) + 0);
		var configContentType = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
		var configValues = {"contentType":contentType};	

		configContentType.config.forEach(function(el,index){
			configValues[el.name] = req.body[el.name];
		});


		fs.mkdirSync(siteURL + '/content_manager/'+contentType+'/' + id);

		var config = {
			"id":id,
			"name":name,
			"createdDate":createdDate,
			"configValues": configValues
		}

		var mixinContent = "mixin "+id+"(content)\n";
			mixinContent +="	include view.html";
		
		var includeContents = fs.readFileSync(siteURL + '/content_manager/'+contentType+'/include.pug').toString() + '\n';
		includeContents +=  'include ./'+ id +'/mixin.pug';

		fs.writeFileSync(siteURL + '/content_manager/'+contentType+'/include.pug', includeContents,function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentType+'/'+ id +'/config.json', JSON.stringify(config,null,4),function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentType+'/'+ id +'/mixin.pug', mixinContent ,function(err){});

		buildContentTemplate('--site ' + site + ' --contentType ' + contentType + ' --contentID ' + id , res)
	});


	app.post('/site/:id/content/edit', function (req, res) {
		if(req.body.id != 'empty_content'){
			var site = req.params.id;
			var siteURL = getURLSite(site);
			var contentType = req.body.contentType;
			var id = req.body.id;
			var name = req.body.name;
			var htmlContent = req.body.htmlContent;
			var modifiedDate = new Date().toGMTString();
			var configContentType = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
			var configValues = {"contentType":contentType};	

			var config = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/' + id + '/config.json'));

			configContentType.config.forEach(function(el,index){
				configValues[el.name] = req.body[el.name];
			});

			config['name'] = name;
			config['modifiedDate'] = modifiedDate;
			config['configValues'] = configValues;

			fs.writeFileSync(siteURL + '/content_manager/'+contentType+'/'+ id +'/config.json', JSON.stringify(config,null,4),function(err){});



			execGulpTask('gulp buildContentTemplate --site '+site+' --contentType '+contentType+' --contentID ' + id + ' & gulp deploySites --env dev --site ' + site + ' & gulp removeTMP', res);
		};
	});

	//Eliminar contenido
	app.post('/site/:id/content/delete', function (req, res) {
		if(req.body.idContent != 'empty_content'){
			var site = req.params.id;
			var contentId = req.body.id;
			var contentType = req.body.contentType;
			deleteContent(site,contentId,contentType);
			deploySites('--env dev --site ' + site, res);
		}
	});

	app.post('/site/:id/content/contentType/add', function (req, res) {
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var contentTypeName = req.body.name;
		var contentTypeTemplate = req.body.template;
		var config = {"config":req.body.config};

		fs.mkdirSync(siteURL + '/content_manager/'+contentTypeName);

		var mixinContent = "include ./include.pug\n\n";
			mixinContent += "mixin content_"+contentTypeName+"(contentName)\n";
			mixinContent +="	+#{contentName}";

		var includeContents = fs.readFileSync(siteURL + '/content_manager/include_contents.pug').toString()  + '\n';	
		includeContents +=  'include ./'+ contentTypeName +'/mixin.pug';

		fs.writeFileSync(siteURL + '/content_manager/include_contents.pug', includeContents,function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/include.pug','',function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/config.json', JSON.stringify(config,null,4),function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/mixin.pug', mixinContent ,function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/template.pug', contentTypeTemplate ,function(err){});

		return res.status(200).send();

	});

	app.post('/site/:id/content/contentType/edit', function (req, res) {
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var contentTypeName = req.body.name;
		var contentTypeTemplate = req.body.template;
		var config = {"config":req.body.config};

		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/config.json', JSON.stringify(config,null,4),function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/template.pug', contentTypeTemplate ,function(err){});
		
		execGulpTask('gulp buildContentTemplate --site '+site+' --contentType '+contentTypeName+ ' & gulp deploySites --env dev --site ' + site + ' & gulp removeTMP', res);
		
	});

	app.post('/site/:id/content/contentType/delete/', function (req, res) {
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var contentTypeName = req.body.contentTypeName;

		//Borramos primero las referencias al tipo de contenido
		var sitemap = fs.readFileSync(siteURL + '/sitemap.json').toString();
		sitemap = JSON.parse(sitemap.replace('"contentType": "'+contentTypeName+'"','"contentType": "content"'));
		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

		//Borramos las referencias a los contenidos asociados al tipo de contenido

		if(fs.existsSync(siteURL + '/content_manager/' + contentTypeName)){
			dirContentTypeSite = fs.readdirSync(siteURL + '/content_manager/' + contentTypeName);
		}
		
		dirContentTypeSite.forEach(function(content,index){

			if(content.split('.').length <= 1){	
				deleteContent(site,content,contentTypeName);
			}
		});	


		var includeContents = fs.readFileSync(siteURL + '/content_manager/include_contents.pug').toString();
		includeContents = includeContents.replace('include ./'+contentTypeName+'/mixin.pug','')
		fs.writeFileSync(siteURL + '/content_manager/include_contents.pug', includeContents,function(err){});

		rimraf(siteURL + '/content_manager/'+contentTypeName,function () {
			console.log("ELIMINADO TIPO CONTENIDO -> " + contentTypeName);
		});
		
		deploySites('--env dev --site ' + site, res);
		
	});	

	app.get('/site/:id/content/contentType/detail/:contentTypeName', function (req, res) {
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var contentTypeName = req.params.contentTypeName;

		var config = JSON.parse(fs.readFileSync(siteURL + '/content_manager/config.json'));
		var content = JSON.parse(fs.readFileSync(siteURL + '/content_manager/' + contentTypeName + '/config.json'));
		var template = fs.readFileSync(siteURL + '/content_manager/' + contentTypeName + '/template.pug').toString();
		


		return res.status(200).send(Object.assign(config,{"content":content},{"template":template},{"name":contentTypeName}));
		
	});

	app.get('/site/:id/content/contentType/config', function (req, res) {
		var site = req.params.id;
		var siteURL = getURLSite(site);
		var config = JSON.parse(fs.readFileSync(siteURL + '/content_manager/config.json'));
		
		return res.status(200).send(config);
		
	});	

});

function getLayoutColumns(id){
	id = id.split('.pug')[0];
	var filepath = '';
	if(fs.existsSync(pathBundles + '/layouts/' + id + '.pug')){
		filepath = pathBundles + '/layouts/' + id + '.pug';
	}

	if(fs.existsSync(pathPlugins + '/layouts/' + id + '.pug')){
		filepath = pathPlugins + '/layouts/' + id + '.pug';
	}

	try{
		if(filepath != ''){
			var blocks = [];
			var file = fs.readFileSync(filepath).toString();
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
	exec('gulp deploy ' + argv + ' && gulp removeTMP', (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('DEPLOY ERROR:' + err);
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('DEPLOY FINISHED: ' + stdout + stderr);
	  res.status(200).send('SUCCESSFULL');
	});
}

function deploySites(argv,res,argv_res){
	const { exec } = require('child_process');
	console.log('START DEPLOY SITES gulp deploySites ' + argv);
	exec('gulp deploySites ' + argv + ' && gulp removeTMP', (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('DEPLOY ERROR:' + err);
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('DEPLOY FINISHED: ' + stdout + stderr);
	  res.status(200).send(argv_res);
	});
}

function buildContentTemplate(argv,res,argv_res){
	const { exec } = require('child_process');
	console.log('START BUILD TEMPLATE gulp buildContentTemplate ' + argv);
	exec('gulp buildContentTemplate ' + argv, (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('BUILD ERROR:' + err);
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('BUILD FINISHED: ' + stdout + stderr);
	  res.status(200).send(argv_res);
	});
}

function execGulpTask(argv,res,argv_res){
	const { exec } = require('child_process');
	console.log('START ' + argv);
	exec(argv, (err, stdout, stderr) => {
	  if (err) {
	    // node couldn't execute the command
	    console.log('BUILD ERROR:' + err);
	    res.send('ERROR');
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log('EXEC FINISHED: ' + stdout + stderr);
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

function getComponentsGeneralConfig(){
	var config = {};

	if(fs.existsSync(pathPlugins + '/components/config.json')){
		config = JSON.parse(fs.readFileSync(pathPlugins + '/components/config.json'));
	}	

	else if(fs.existsSync(pathBundles + '/components/config.json')){
		config = JSON.parse(fs.readFileSync(pathBundles + '/components/config.json'));
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

function buildDefaultComponentData(config, componentContent){

	var componentContent = componentContent || {};

	config.forEach(function(element,i){

		if(element.type=="array"){
			componentContent[element.name] = [];
			componentContent[element.name].push(buildDefaultComponentData(element.arrayContent));
		}

		else if(element.type=="group"){
			componentContent[element.name] = buildDefaultComponentData(element.content);
		}

		else{
			componentContent[element.name]='';
		}

	});	

	return componentContent;

}

function pagesList(sitemap, originalSiteMap){

	var pages = [];

	sitemap.forEach(function(element,i){
		var position = findIndex(originalSiteMap,element.id);
		if(element.childs.length > 0){
			pages.push({"id":element.id,"name":element.name,"position":position.join()});
			pages = pages.concat(pagesList(element.childs,originalSiteMap));
		}
		else{
			pages.push({"id":element.id,"name":element.name,"position":position.join()});
		}

	});
	return pages;
}

function getDetailComponentByID(idComponent,sitemap){

	var component;

	sitemap.forEach(function(page,index){
		if(Object.keys(page.layout.content).length > 0){

			Object.keys(page.layout.content).forEach(function(key,i){
				if(page.layout.content[key].length > 0){
					page.layout.content[key].forEach(function(currentComponent){
						if(currentComponent.id == idComponent){
							component = currentComponent;	
						}
					});
				}	
			})			
		}

	})
	return component;
}

function deleteContent(site,contentId,contentType){
	if(contentId != 'empty_content'){
		var siteURL = getURLSite(site);
		var sitemap = fs.readFileSync(siteURL + '/sitemap.json').toString();
		sitemap = sitemap.replace(contentId,'empty_content');
		sitemap = JSON.parse(sitemap.replace('"contentType": "'+contentType+'"','"contentType": "content"'));
		fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));

		var includeContents = fs.readFileSync(siteURL + '/content_manager/'+contentType+'/include.pug').toString();

		includeContents = includeContents.replace('include ./'+contentId+'/mixin.pug','')
		fs.writeFileSync(siteURL + '/content_manager/'+contentType+'/include.pug', includeContents,function(err){});

		rimraf(siteURL + '/content_manager/'+contentType+'/' + contentId,function () {
			console.log("ELIMINADO CONTENIDO -> " + contentId);
		});
	}
}

//Busca si un componente esta en uso en algun site y devuelve true o false si lo encuentra o no
function componentInUse(componentName){

	var componentName = componentName;
	var sitesList = getDirectories(pathBundles + '/sites/').concat(getDirectories(pathPlugins + '/sites/'));

	for(var i=0; i < sitesList.length; i++){
		var siteURL = getURLSite(sitesList[i]);
		var currentSitemap = fs.readFileSync(siteURL + '/sitemap.json').toString();
		
		if(currentSitemap.indexOf(componentName) >= 0){
			return true;
		}

	}
	return false;
}