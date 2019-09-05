const fs = require('fs');
const functions = require('./functions.js');

const variables = require("./variables.js");
const defaultSite = variables.defaultSite;

module.exports = (app) => {

	/**
	* Service to create a new page of a specific site
	* @param {string} - idSite - Name of the site where the page will be created
	* @param {number} - position - Position number where the page will be created inside the nav tree
	* @param {string} - parentPosition - String of index of the page parent. "1,0,3"
	* @param {string} - name - Name of the page
	* @param {string} - url - URL of the page
	* @param {string} - title - Meta title of the page
	* @param {string} - description - Meta description of the page
	* @param {string} - keywords - Meta keywords of the page
	* @param {string} - layout - Name of the layout used in the page
	* @param {string} - hidden - If 'true' the page will not be show in site navigation
	*/
	app.post('/site/:idSite/page/add', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var position = [req.body.position] || [sitemap.pages.length];
			var parentPosition =  req.body.parentPosition !== undefined && req.body.parentPosition != '' ? req.body.parentPosition.split(',') : [];
			var patron = "sitemap.pages";

			var name = req.body.name,
				id = functions.normaliza(name) + '-' + parseInt(Math.random() * (9999 - 0) + 0),
				url = req.body.url || '/' + name,
				src = "/" + functions.normaliza(name) + '.html',
				title = req.body.title || name,
				description = req.body.description || '',
				keywords = req.body.keywords || '',
				layout = req.body.layout || '',
				hidden = req.body.hidden || '';

			var columns = functions.getLayoutColumns(layout);
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

			functions.deploySites('--site '+ site +' --env dev --pag ' + id , res)
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

	/**
	* Service to modifify an existing page of a specific site
	* @param {string} - id - Name of the page to be modified
	* @param {string} - idSite - Name of the site of the page
	* @param {number} - position - Position number where the page will be created inside the nav tree
	* @param {string} - parentPosition - String of index of the page parent. "1,0,3"
	* @param {string} - name - Name of the page
	* @param {string} - url - URL of the page
	* @param {string} - title - Meta title of the page
	* @param {string} - description - Meta description of the page
	* @param {string} - keywords - Meta keywords of the page
	* @param {string} - layout - Name of the layout used in the page
	* @param {string} - hidden - If 'true' the page will not be show in site navigation
	*/
	app.post('/site/:idSite/page/edit/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = functions.getURLSite(site);
			var id = req.params.id,
				sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json')),
				editedPage = functions.findPage(sitemap.pages,id),
				index = functions.findIndex(sitemap.pages,id),
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

				var columns = functions.getLayoutColumns(layout);
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

			functions.deployPage('--site '+ site +' --env dev --pag ' + editedPage['id'], res)
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

	/**
	* Service to delete an existing page of a specific site
	* @param {string} - id - Name of the page to be deleted
	* @param {string} - idSite - Name of the site of the page
	*/
	app.post('/site/:idSite/page/delete/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = functions.getURLSite(site);
			var id = req.params.id,
				sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json')),
				index = functions.findIndex(sitemap.pages,id);

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
			functions.deploySites('--env dev --site ' + site , res);
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

	/**
	* Service to get the detail of an existing page of a specific site
	* @param {string} - id - Name of the page
	* @param {string} - idSite - Name of the site of the page
	* @return {json} JSON with the page detail
	*/
	app.get('/site/:idSite/page/detail/:id', function (req, res) {
		try{
			var site = req.params.idSite;
			var idPage = req.params.id;
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var detailPage = functions.findPage(sitemap.pages,idPage);
			var positionPage = functions.findIndex(sitemap.pages,idPage);
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

	/**
	* Service to publish an existing page of a specific site. The page will be publish from dev enviroment to public enviroment
	* @param {string} - idPage - Name of the page to be modified
	* @param {string} - idSite - Name of the site of the page
	*/
	app.post('/site/:idSite/page/:idPage/publish', function (req, res) {
		try{
			var site = req.params.idSite;
			var page = req.params.idPage;
			functions.deployPage('--site ' + site + ' --pag '+ page , res);
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

	/**
	* GET service to obtain the pages list
	* @param {string} - idSite - Name of the site
	* @return {array} Array of pages availables in the site ['page11','page2',...]
	*/
	app.get('/site/:idSite/page/list', function (req, res) {
			var site = req.params.idSite;
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));

			res.status(200).send(functions.pagesList(sitemap.pages,sitemap.pages));
			
	});
}