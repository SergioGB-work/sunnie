const fs = require('fs');
const functions = require('./functions.js');
const fsextra = require("fs-extra");
const rimraf = require("rimraf");
const fileUpload = require('express-fileupload');
const variables = require("./variables.js");
const defaultSite = variables.defaultSite;

const pwaImageSizes = [
	{
		"width":72,
		"height":72
	},	
	{
		"width":96,
		"height":96
	},	
	{
		"width":128,
		"height":128
	},
	{
		"width":144,
		"height":144
	},
	{
		"width":152,
		"height":152
	},
	{
		"width":192,
		"height":192
	},
	{
		"width":384,
		"height":384
	},
	{
		"width":512,
		"height":512
	}
]

/**
 * @module site
 */

module.exports = (app) => {

	/**
	* @function
	* Service to publish an existing site. The full site will be publish from dev enviroment to public enviroment
	* @param {string} - idSite - Name of the site of the page
	*/
	app.post('/site/:idSite/publish', function (req, res) {
		try{
			var site = req.params.idSite;
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			functions.deployPage('--site ' + site + ' --publishUrl ' + sitemap.site.publishUrl  , res, 'Publicar el site <strong>' + sitemap.site.name + '</strong>');
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"PUBLISH_SITE_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* GET service to obtain the sites list
	* @return {aray} Array of sites availables [{"name":"site1","url":"/site1"},{"name":"site2","url":"/site2"},...]
	*/
	app.get('/site/list', function (req, res) {
		try{
			var dirSitesBundles = fs.readdirSync('./app/bundles/src/sites/');
			var dirSitesPlugins = fs.readdirSync('./app/plugins/sites/');

			var dirSites = dirSitesBundles.concat(dirSitesPlugins);
			var sites = [];

			dirSites.forEach(function(element,index){
				var siteURL = functions.getURLSite(element);
				var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
				sites.push({'name':element,'url':sitemap.site.url});
			});	

			res.send(sites);
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_LIST_ERROR"
				}
			)
		};			
	});	

	/**
	* @function
	* Service to create a new site
	* @param {string} - name - Name of the site
	* @param {string} - url - URL of the site
	* @param {string} - enableChatBot - If true, the develop chatbot assitant will be show in dev enviroment
	* @param {string} - theme - Name of theme that the new site will use
	*/
	app.post('/site/add',fileUpload(), async function (req, res) {
		try{
			var siteName = req.body.name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
			var siteURL = req.body.url.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
			var enableChatBot = req.body.enableChatBot;
			var siteTheme = {"theme": req.body.theme};
			var defaultSiteURL = functions.getURLSite(defaultSite);

			var file = JSON.parse(JSON.stringify(req.files));
			delete file['siteLogo'];
			var siteLogo = JSON.parse(JSON.stringify(req.files.siteLogo));
			var manifest = functions.generateManifest(siteURL,file,pwaImageSizes,req.body);
			var publishUrl = req.body.publishUrl || 'app/public';

			var cachedPages = [];
			var serviceWorkerType = req.body.serviceWorkerType || '';
			var offlinePage = req.body.offlinePage || '';
			var contentCustomServiceWorker = req.body.customServiceWorkerContent || '';

			Object.keys(req.body).forEach(function(key){
				if(key.indexOf('cachedPage-') > -1){
					cachedPages.push(req.body[key]);
				}
			})


			if(siteURL[0]!= '/'){
				siteURL= '/' + siteURL;
			}

			var sitemap = {
				"site":{
					"name": siteName,
					"url": siteURL,
					"enableChatBot":enableChatBot,
					"publishUrl":publishUrl,
					"serviceWorker":{
						"type":serviceWorkerType,
						"offlinePage":offlinePage,
						"cachedPages":cachedPages,
						"customTemplate":contentCustomServiceWorker
					},
					"logo": siteLogo
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

			var buffer = new Buffer.from(siteLogo.data.data);

			fs.writeFile(siteURL + '/media/' + siteLogo.name, buffer,async (err) => {
				if (err) throw err;
			});

			fs.mkdirSync(pathPlugins + '/sites/' + siteName);
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/build.json', JSON.stringify(siteTheme,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/sitemap.json', JSON.stringify(sitemap,null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/manifest.json', JSON.stringify(manifest,null,4),function(err){});

			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/');
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/es/');
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/en/');
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/es/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/es/'+defaultSite+'.json')),null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/es/custom.json', JSON.stringify({},null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/en/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/en/'+defaultSite+'.json')),null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/en/custom.json', JSON.stringify({},null,4),function(err){});
			

			fsextra.copy(defaultSiteURL + '/content_manager/', pathPlugins + '/sites/' + siteName+'/content_manager/',function(err){});

			functions.deployPage('--env dev --site ' + siteName , res, 'Añadir site <strong>' + siteName + '</strong>');
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

	/**
	* @function
	* Service to get the detail of an existing site
	* @param {string} - id - Name of the site
	* @return {json} JSON with the site detail
	*/
	app.get('/site/detail/:id', function (req, res) {
		try{
			var site = req.params.id;
			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));		
			var build = JSON.parse(fs.readFileSync(siteURL + '/build.json'));
			var manifest = JSON.parse(fs.readFileSync(siteURL + '/manifest.json'));

			res.status(200).send(Object.assign(sitemap.site, build, {"manifest":manifest}));
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_DETAIL_ERROR"
				}
			)
		};		
	});

	/**
	* @function
	* Service to modify a site
	* @param {string} - id - ID of the site
	* @param {string} - name - Name of the site
	* @param {string} - url - URL of the site
	* @param {string} - enableChatBot - If true, the develop chatbot assitant will be show in dev enviroment
	* @param {string} - theme - Name of theme that the site will use
	*/	

	app.post('/site/edit/:id',fileUpload(), async function (req, res) {
		try{
			var site = req.params.id;
			var name = req.body.name;
			var enableChatBot = req.body.enableChatBot;
			var url = req.body.url;
			var theme = req.body.theme;
			var publishUrl = req.body.publishUrl;

			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var build = JSON.parse(fs.readFileSync(siteURL + '/build.json'));
			var oldUrl = sitemap.site.url;

			var file = JSON.parse(JSON.stringify(req.files));
			
			if(file && file.siteLogo !== undefined){
				delete file['siteLogo']
			}	

			var siteLogo = req.files && req.files.siteLogo ? JSON.parse(JSON.stringify(req.files.siteLogo)) : sitemap.site.logo;
			var siteLogoUrl =  req.files && req.files.siteLogo ? '/media/' + siteLogo.name : sitemap.site.logo

			var manifest = functions.generateManifest(siteURL,file,pwaImageSizes,req.body);
			var cachedPages = [];
			var serviceWorkerType = req.body.serviceWorkerType || '';
			var offlinePage = req.body.offlinePage || '';
			var contentCustomServiceWorker = req.body.customServiceWorkerContent || '';

			Object.keys(req.body).forEach(function(key){
				if(key.indexOf('cachedPage-') > -1){
					cachedPages.push(req.body[key]);	
				}
			})

			if(req.files && req.files.siteLogo !== undefined){
				var buffer = new Buffer.from(siteLogo.data.data);
				fs.writeFile(siteURL + '/media/' + siteLogo.name, buffer,async (err) => {
					if (err) throw err;
				});
			}

			functions.generateServiceWorker(siteURL,serviceWorkerType,offlinePage, cachedPages, contentCustomServiceWorker, );

			sitemap.site.name = name;
			sitemap.site.url = url;
			sitemap.site.publishUrl = publishUrl;
			sitemap.site.enableChatBot = enableChatBot;
			sitemap.site.logo = siteLogoUrl;
			sitemap.site.serviceWorker.offlinePage = offlinePage;
			sitemap.site.serviceWorker.type = serviceWorkerType;
			sitemap.site.serviceWorker.cachedPages = cachedPages;
			sitemap.site.serviceWorker.customTemplate = contentCustomServiceWorker;
			build.theme = theme;

			fs.writeFileSync(siteURL + '/sitemap.json', JSON.stringify(sitemap,null,4));
			fs.writeFileSync(siteURL + '/build.json', JSON.stringify(build,null,4));
			fs.writeFileSync(siteURL + '/manifest.json', JSON.stringify(manifest,null,4));

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
			fs.rename( siteURL + '/../../../development/sites/' + site, siteURL + '/../../../development/sites/' + name, function(err) {
			    if ( err ) console.log('ERROR: ' + err);
			});

			//Elimino la carpeta en build del site
			rimraf(siteURL + '/../../../build/sites/' + site,function () {

			});

			functions.deployPage('--env dev --site ' + name , res,{"name":name, "url":url, "oldUrl": oldUrl},'Editar el site <strong>' + name + '</strong>');
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"EDIT_SITE_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* Service to delete an existing site
	* @param {string} - id - ID of the site to be deleted
	*/
	app.post('/site/delete/:id', function (req, res) {
		try{	
			var site = req.params.id;
			var siteURL = functions.getURLSite(site);

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
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"SITE_DELETE_ERROR"
				}
			)
		};			
	});

	/**
	* @function
	* GET service to obtain the var locales of the site
	* @param {string} - id - ID of the site
	* @return {json} JSON with the site detail
	*/
	app.get('/site/:id/get-locales', function (req, res) {
		try{
			var site = req.params.id;
			var siteURL = functions.getURLSite(site);
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

	/**
	* @function
	* Service to update the var locales of the site
	* @param {string} - id - ID of the site
	* @param {json} - locales - JSON with the var locales and their tranlations
	*/
	app.post('/site/:id/update-locales', function (req, res) {

		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
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

		functions.deploySites('--env dev --site ' + site, res,'','Actualizar variables de idioma');
	});	
}	