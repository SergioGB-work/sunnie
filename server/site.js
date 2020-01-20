const fs = require('fs');
const functions = require('./functions.js');
const fsextra = require("fs-extra");
const rimraf = require("rimraf");
const imagemagick = require('imagemagick');
const fileUpload = require('express-fileupload');
const variables = require("./variables.js");
const defaultSite = variables.defaultSite;

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
			functions.deployPage('--site ' + site  , res);
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
	app.post('/site/add', function (req, res) {
		try{
			var siteName = req.body.name;
			var siteURL = req.body.url;
			var enableChatBot = req.body.enableChatBot;
			var siteTheme = {"theme": req.body.theme};
			var defaultSiteURL = functions.getURLSite(defaultSite);

			var manifest = {
				"name": req.body.manifest_name || '',
				"short_name": req.body.manifest_short_name || '',
				"theme_color": req.body.manifest_theme_color || '',
				"background_color": req.body.manifest_background_color || '',
				"display": req.body.manifest_display || '',
				"orientation": req.body.manifest_orientation || '',
				"scope": req.body.manifest_scope || '',
				"description" : req.body.manifest_description || '',
				"start_url" : req.body.manifest_start_url || '',
				"lang" : req.body.manifest_lang || ''
			}


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
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/manifest.json', JSON.stringify(manifest,null,4),function(err){});

			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/');
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/es/');
			fs.mkdirSync(pathPlugins + '/sites/' + siteName + '/locale/en/');
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/es/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/es/'+defaultSite+'.json')),null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/es/custom.json', JSON.stringify({},null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/en/'+siteName+'.json', JSON.stringify(JSON.parse(fs.readFileSync(defaultSiteURL + '/locale/en/'+defaultSite+'.json')),null,4),function(err){});
			fs.writeFileSync(pathPlugins + '/sites/' + siteName+'/locale/en/custom.json', JSON.stringify({},null,4),function(err){});
			

			fsextra.copy(defaultSiteURL + '/content_manager/', pathPlugins + '/sites/' + siteName+'/content_manager/',function(err){});

			functions.deployPage('--env dev --site ' + siteName , res);
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

			var siteURL = functions.getURLSite(site);
			var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json'));
			var build = JSON.parse(fs.readFileSync(siteURL + '/build.json'));
			var oldUrl = sitemap.site.url;

			var file = JSON.parse(JSON.stringify(req.files));
			var file_details = {};

			Object.keys(file).forEach(function(el){

				let file_name = file[el].name;
				let realName = file_name.split('.');
				let extension = realName.pop();
					realName = realName.join('.');

				if(!file_name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)){
					return res.status(200).send(

						{
							"filename":file_name,
							"error":{
								"code":"FILE_FORMAT_ERROR"								
							}
						}
					)
				}

				var buffer = new Buffer.from(file[el].data.data)

				//uncomment await if you want to do stuff after the file is created
				if(!fs.existsSync(siteURL + '/media')){
					fs.mkdirSync(siteURL + '/media');
				}

				if(!fs.existsSync(siteURL + '/media/pwa')){
					fs.mkdirSync(siteURL + '/media/pwa');
				}

				fs.writeFile(siteURL + '/media/pwa/' + file_name, buffer, async(err) => {
					imagemagick.resize({
					  srcPath: siteURL + '/media/pwa/' + file_name,
					  dstPath: siteURL + '/media/pwa/' + realName + '.' + extension,
					  width:   256
					}, function(err, stdout, stderr){
					  if (err) throw err;
					  console.log('resized kittens.jpg to fit within 256x256px');
					});

				});		
			});

			var manifest = {
				"name": req.body.manifest_name || '',
				"short_name": req.body.manifest_short_name || '',
				"theme_color": req.body.manifest_theme_color || '',
				"background_color": req.body.manifest_background_color || '',
				"display": req.body.manifest_display || '',
				"orientation": req.body.manifest_orientation || '',
				"scope": req.body.manifest_scope || '',
				"description" : req.body.manifest_description || '',
				"start_url" : req.body.manifest_start_url || '',
				"lang" : req.body.manifest_lang || ''
			}			

			sitemap.site.name = name;
			sitemap.site.url = url;
			sitemap.site.enableChatBot = enableChatBot;
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

			functions.deployPage('--env dev --site ' + name , res,{"name":name, "url":url, "oldUrl": oldUrl});
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

		functions.deploySites('--env dev --site ' + site, res);
	});	
}	