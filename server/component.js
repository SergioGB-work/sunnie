const fs = require('fs');
const functions = require('./functions.js');
const rimraf = require("rimraf");
const pug = require("pug");
const html2pug = require('html2pug');

const variables = require("./variables.js");
const defaultSite = variables.defaultSite;

/**
 * @module component
 */
module.exports = (app) => {


	/**
	* @function
	* Service to add a component to a page
	* @param {string} - idSite - Name of the site
	* @param {string} - idPage - ID of the page
	* @param {string} - layoutColumn - Name of the column where the component will add
	* @param {number} - layoutColumnPosition - Position number where the component will add inside the layout column
	* @param {string} - name - Name of th component to add
	* @param {json} - content - Content of the component. The fields are configured in config.json
	* @param {string} - title - Title of the component
	* @param {string} - showTitle - If 'true' the component will show the title text
	* @param {string} - full - If 'true' the component will show filling the full width of the column
	* @param {string} - classes - String of additionals classes to add to the component
	* @param {string} - newComponent - If 'true' the component will show a default message until it will be configured
	*/
	app.post('/site/:idSite/page/:idPage/component/add', function (req, res) {
		//Configuracion de colocacion
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var layoutColumnPosition = req.body.layoutColumnPosition || 0;
			var siteURL = functions.getURLSite(site);
			//Datos del componente
			var componentName = req.body.name || 'Component';
			var componentId = functions.normaliza(componentName) + '-' + parseInt(Math.random() * (9999 - 0) + 0);
			var componentContent = req.body.content || {};
			var componentTitle = req.body.title || componentName;
			var componentShowTitle = req.body.showTitle || 'true';
			var componentFull = req.body.full || 'false';
			var componentClasses = req.body.classes || '';
			var componentNew = req.body.newComponent || 'false';
			var configComponent = functions.getComponentConfig(componentName);	

			componentContent = functions.buildDefaultComponentData(configComponent.config, componentContent)

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
			var editedPage = functions.findPage(sitemap.pages,idPage);
			var index = functions.findIndex(sitemap.pages,idPage);

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
			functions.deployPage('--env dev --site ' + site + ' --pag ' + editedPage['id'], res,"Añadir el componente <strong>" + componentName + "</strong>en la página <strong>" + editedPage.name + "</strong>");
		}
		catch(e){
			console.log(e);
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

	/**
	* @function
	* Service to edit a component added to a page
	* @param {string} - idSite - Name of the site
	* @param {string} - idPage - ID of the page
	* @param {string} - layoutColumn - Name of the column where the component will add
	* @param {number} - layoutColumnPosition - Position number where the component will add inside the layout column
	* @param {string} - name - Name of th component to add
	* @param {json} - content - Content of the component. The fields are configured in config.json
	* @param {string} - title - Title of the component
	* @param {string} - showTitle - If 'true' the component will show the title text
	* @param {string} - full - If 'true' the component will show filling the full width of the column
	* @param {string} - classes - String of additionals classes to add to the component
	* @param {string} - newComponent - If 'true' the component will show a default message until it will be configured
	*/
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
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = functions.findPage(sitemap.pages,idPage);
			var index = functions.findIndex(sitemap.pages,idPage);

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
			functions.deployPage('--env dev --site ' + site + ' --pag ' + editedPage['id'] , res, "Desplegar los cambios del componente <strong>" + componentName + "</strong>en la página <strong>" + editedPage.name + "</strong>");
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"EDIT_COMPONENT_ERROR"
				}
			)
		};	
	});

	/**
	* @function
	* Service to delete a component added to a page
	* @param {string} - idSite - Name of the site
	* @param {string} - idPage - ID of the page
	* @param {string} - layoutColumn - Name of the column where the component will add
	* @param {number} - layoutColumnPosition - Position number where the component will add inside the layout column
	*/
	app.post('/site/:idSite/page/:idPage/component/delete', function (req, res) {
		try{
			//Configuracion de colocacion
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var componentPosition = req.body.componentPosition || '';
			var siteURL = functions.getURLSite(site);

			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = functions.findPage(sitemap.pages,idPage);
			var index = functions.findIndex(sitemap.pages,idPage);
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
			functions.deploySites('--env dev --site ' + site + ' --pag ' + editedPage['id'] , res,{"column":layoutColumn,"position":componentPosition},"Eliminar el componente de la página <strong>" + editedPage.name + "</strong>");
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"DELETE_COMPONENT_ERROR"
				}
			)
		};	
	});

	/**
	* @function
	* Service to move the position of a component added to a page
	* @param {string} - idSite - Name of the site
	* @param {string} - idPage - ID of the page
	* @param {string} - layoutColumn - Name of the new column where the component will add
	* @param {string} - oldLayoutColumn - Name of the last column where the component was
	* @param {number} - layoutColumnPosition - New position number where the component will add inside the layout column
	* @param {number} - oldLayoutColumnPosition - Last position number where the component was added inside the layout column
	*/
	app.post('/site/:idSite/page/:idPage/component/move', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn || '';
			var layoutColumnPosition = req.body.layoutColumnPosition || 0;
			var oldPosition = req.body.oldPosition;
			var oldlLayoutColumn = req.body.oldLayoutColumn;

			//Datos del componente
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = functions.findPage(sitemap.pages,idPage);
			var index = functions.findIndex(sitemap.pages,idPage);

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
			functions.deploySites('--env dev --site ' + site + ' --pag ' + editedPage['id'], res, '',"Mover de posición el componente <strong>" + componentName + "</strong> de la página <strong>" + editedPage.name + "</strong>" );
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"MOVE_COMPONENT_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* Service to create a new component. Later, the user will can add it to the page
	* @param {string} - idSite - Name of the site
	* @param {string} - name - Name of the new component
	* @param {string} - config - Config of the new component
	* @param {number} - componentView - View typed in PUG of the component
	* @param {number} - componentJS - Javascript code of the component
	* @param {number} - componentCSS - CSS code of the component
	*/
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

			//Se hace una doble conversion para compobar algunos errores de formato, si da error lo capturara el try catch
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

			if(e.code != '' && e.code !== undefined && e.code !== null){
				res.status(412).send(
					{
						"error":{
							"code":"412",
							"statusCode":e.code.replace(':','_'),
							"data":e.msg,
							"close": false
						}
					}
				)			
			}			

			res.status(412).send(
				{
					"error":{
						"code":"412",
						"statusCode":"COMPONENT_CREATE_ERROR"
					}
				}
			)
		};

	});

	/**
	* @function
	* Service to edit a created component. Only the components allocated in plugins will can be edited
	* @param {string} - idSite - Name of the site
	* @param {string} - name - Name of the component
	* @param {string} - config - Config of the component
	* @param {number} - componentView - View typed in PUG of the component
	* @param {number} - componentJS - Javascript code of the component
	* @param {number} - componentCSS - CSS code of the component
	*/
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

			componentView.split('\n').forEach(function(line){
				line = line.replace(/\s+$/,"");
				view += line + "\n";
			});

			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/view.pug',view,function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/config.json', JSON.stringify(componentConfig,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/main.scss', componentCSS ,function(err){});
			fs.writeFileSync(pathPlugins + '/components/'+componentName+'/main.js', componentJS ,function(err){});
			
			functions.execGulpTask('gulp deploy --env dev & gulp removeTMP', res, '', "Editar el componente <strong>" + componentName + "</strong>");
		
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

			if(e.code != '' && e.code !== undefined && e.code !== null){

				res.status(412).send(
					{
						"error":{
							"code":"412",
							"statusCode":e.code.replace(':','_'),
							"data":e.msg,
							"close": false
						}
					}
				)			
			}

			res.status(412).send(
				{
					"error":{
						"code":"412",
						"statusCode":"COMPONENT_EDIT_ERROR"
					}
				}
			)
		};
	});

	/**
	* @function
	* GET Service to obtain detail of a created component. Only the components allocated in plugins will can be obtained
	* @param {string} - idSite - Name of the site
	* @param {string} - componentName - Name of the component
	* @return {json} JSON with the detail of the component
	*/
	app.get('/site/:id/component/detail-created/:componentName', function (req, res) {
		var componentName = req.params.componentName;
		var content = functions.getComponentConfig(componentName);
		var config = functions.getComponentsGeneralConfig();
		var componentView = fs.readFileSync(pathPlugins + '/components/'+componentName+'/view.pug').toString();
		var componentCSS = fs.readFileSync(pathPlugins + '/components/'+componentName+'/main.scss').toString();
		var componentJS = fs.readFileSync(pathPlugins + '/components/'+componentName+'/main.js').toString();

		res.status(200).send(Object.assign({"name":componentName,"componentView":componentView,"componentCSS":componentCSS,"componentJS":componentJS},config,{"content":content}));

	});

	/**
	* @function
	* Service to delete a created component. You can only delete components that it is not in used by any site
	* @param {string} - idSite - Name of the site
	* @param {string} - name - Name of the component
	*/
	app.post('/site/:id/component/delete-created', function (req, res) {

		var componentName = req.body.name;

		if(fs.existsSync(pathPlugins + '/components/' + componentName)){

			if(!functions.componentInUse(componentName)){

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
			console.log(e);
			res.status(412).send({
				"code":"412",
				"statusCode":"COMPONENT_DELETE_ERROR_NOT_EXIST"
			})			
		}

	});

	/**
	* @function
	* GET Service to obtain the general config of the components
	* @param {string} - idSite - Name of the site
	* @return {json} JSON with the general config of the components
	*/
	app.get('/site/:id/component/generalConfig', function (req, res) {
		var config = functions.getComponentsGeneralConfig();
		return res.status(200).send(config);
		
	});

	/**
	* @function
	* GET service to obtain a list of components
	* @return {array} ARRAY with a list of components ['component1','component2',...]
	*/
	app.get('/component/list', function (req, res) {
		try{
			var dirComponentsBundles = functions.getDirectories(pathBundles + '/components/');
			var dirComponentsPlugins = functions.getDirectories(pathPlugins + '/components/');
			res.send(dirComponentsBundles.concat(dirComponentsPlugins));
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_LIST_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* GET service to obtain a list of components with their details
	* @return {array} ARRAY of jsons with the components and their details
	*/
	app.get('/component/list/detail', function (req, res) {
		try{
			var dirComponentsBundles = functions.getDirectories(pathBundles + '/components/');
			var dirComponentsPlugins = functions.getDirectories(pathPlugins + '/components/');
			
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
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_LIST_ERROR"
				}
			)
		};			
	});	

	/**
	* @function
	* GET service to obtain the detail of a component added to a page in a specific position
	* @param {string} - idSite - Name of the site
	* @param {string} - idPage - Name of the page
	* @param {string} - layoutColumn - Name of the column where the component is
	* @param {string} - componentPosition - Position number where the component is
	* @return {array} ARRAY of jsons with the components and their details
	*/
	app.post('/site/:idSite/page/:idPage/component/detail', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.idPage || '';
			var layoutColumn = req.body.layoutColumn;
			var componentPosition = parseInt(req.body.componentPosition);
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var editedPage = functions.findPage(sitemap.pages,idPage);

			editedPage.layout.content[layoutColumn][componentPosition].position = componentPosition;
			editedPage.layout.content[layoutColumn][componentPosition].layoutColumn = layoutColumn;
			editedPage.layout.content[layoutColumn][componentPosition] = Object.assign(editedPage.layout.content[layoutColumn][componentPosition],functions.getComponentConfig(editedPage.layout.content[layoutColumn][componentPosition].name));
			res.status(200).send(editedPage.layout.content[layoutColumn][componentPosition]);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_DETAIL_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* GET service to obtain the config of a specific component
	* @param {string} - idComponent - Name of the component
	* @return {json} JSON with the component config
	*/
	app.get('/component/config/:idComponent', function (req, res) {
		try{
			var idComponent = req.params.idComponent;
			var config = functions.getComponentConfig(idComponent);
			res.status(200).send(config);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"COMPONENT_CONFIG_ERROR"
				}
			)
		};			
	});

}