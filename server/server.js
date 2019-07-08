var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	rimraf = require("rimraf");

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

			deploySites('--site '+ site +' --env dev --pag ' + src.split('.')[0].split('/')[1] , res)
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

			deployPage('--site '+ site +' --env dev --pag ' + editedPage['src'].split('.')[0].split('/')[1] , res)
		}
		catch(e){
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

			detailPage['position'] = positionPage[positionPage.length - 1]

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

			console.log(componentName);
			console.log(configComponent.config);
			

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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['src'].split('.')[0].split('/')[1], res);
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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['src'].split('.')[0].split('/')[1] , res);
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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['src'].split('.')[0].split('/')[1] , res,{"column":layoutColumn,"position":componentPosition});
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
			deploySites('--env dev --site ' + site + ' --pag ' + editedPage['src'].split('.')[0].split('/')[1] , res);
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
					"statusCode":"PUBLISH_PAGE_ERROR"
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
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale');	
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/es');	
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/en');	
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/es/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/es/'+defaultSite+'.json')),null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/en/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/es/'+defaultSite+'.json')),null,4),function(err){});

			deployPage('--env dev --site ' + siteName , res);
		}
		catch(e){
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
	  console.log('DEPLOY FINISHED');
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