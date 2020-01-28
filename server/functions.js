const fs = require('fs');
const rimraf = require("rimraf");

const variables = require("./variables.js");
const defaultSite = variables.defaultSite;
const imagemagick = require('imagemagick');

module.exports = class functions{

	static getLayoutColumns(id){
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

	static getDirectories(path) {
	  return fs.readdirSync(path).filter(function (file) {
	    return fs.statSync(path+'/'+file).isDirectory();
	  });
	}

	static findPage(pages , id){
		//var page = pages.filter(page => page.id == id)[0];

		var page = '';
		for( var i=0; i<pages.length; i++) {
			if(pages[i].childs.length > 0){
				page = functions.findPage(pages[i].childs , id);
			}

			if(page != '' && page !== undefined){
				return page;
			}

			else if(pages[i].id == id){
				return pages[i];
			}
		};
	}

	static findIndex(pages , id){
		//var page = pages.filter(page => page.id == id)[0];

		var index = [];
		for( var i=0; i<pages.length; i++) {
			if(pages[i].childs.length > 0){
				index = functions.findIndex(pages[i].childs , id);
			}

			if(index != '' && index !== undefined){
				return [i].concat(index);
			}

			else if(pages[i].id == id){
				return [i];
			}
		};
	}

	static deployPage(argv,res){
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

	static deploySites(argv,res,argv_res){
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

	static buildContentTemplate(argv,res,argv_res){
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

	static execGulpTask(argv,res,argv_res){
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

	static normaliza(str) {
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

	static getComponentConfig(idComponent){

		var config = {};

		if(fs.existsSync(pathBundles + '/components/'+idComponent+'/config.json')){
			config = JSON.parse(fs.readFileSync(pathBundles + '/components/'+idComponent+'/config.json'));
		}
		
		if(fs.existsSync(pathPlugins + '/components/'+idComponent+'/config.json')){
			config = JSON.parse(fs.readFileSync(pathPlugins + '/components/'+idComponent+'/config.json'));
		}	
			
		return config;
	}

	static getComponentsGeneralConfig(){
		var config = {};

		if(fs.existsSync(pathPlugins + '/components/config.json')){
			config = JSON.parse(fs.readFileSync(pathPlugins + '/components/config.json'));
		}	

		else if(fs.existsSync(pathBundles + '/components/config.json')){
			config = JSON.parse(fs.readFileSync(pathBundles + '/components/config.json'));
		}
		
		return config;	
	}

	static getURLSite(site){
		if(site == defaultSite){
			return pathBundles + '/sites/' + site;
		}
		else{
			return pathPlugins + '/sites/' + site;
		}

	}

	static buildDefaultComponentData(config, componentContent){

		var componentContent = componentContent || {};

		config.forEach(function(element,i){

			if(element.type=="array"){
				componentContent[element.name] = [];
				componentContent[element.name].push(functions.buildDefaultComponentData(element.arrayContent));
			}

			else if(element.type=="group"){
				componentContent[element.name] = functions.buildDefaultComponentData(element.content);
			}

			else{
				componentContent[element.name]='';
			}

		});	

		return componentContent;

	}

	static pagesList(sitemap, originalSiteMap){
		var pages = [];

		sitemap.forEach(function(element,i){
			var position = functions.findIndex(originalSiteMap,element.id);
			var src = element.src.split('/');
			src = src[src.length - 1];
			if(element.childs.length > 0){
				pages.push({"id":element.id,"name":element.name,"position":position.join(),"src":src});
				pages = pages.concat(functions.pagesList(element.childs,originalSiteMap));
			}
			else{
				pages.push({"id":element.id,"name":element.name,"position":position.join(), "src":src});
			}

		});
		return pages;
	}

	static getDetailComponentByID(idComponent,sitemap){

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

	static deleteContent(site,contentId,contentType){
		if(contentId != 'empty_content'){
			var siteURL = functions.getURLSite(site);
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
	static componentInUse(componentName){

		var componentName = componentName;
		var sitesList = functions.getDirectories(pathBundles + '/sites/').concat(functions.getDirectories(pathPlugins + '/sites/'));

		for(var i=0; i < sitesList.length; i++){
			var siteURL = functions.getURLSite(sitesList[i]);
			var currentSitemap = fs.readFileSync(siteURL + '/sitemap.json').toString();
			
			if(currentSitemap.indexOf(componentName) >= 0){
				return true;
			}

		}
		return false;
	}

	static generateManifest(siteURL,file,pwaImageSizes,data){

		var currentManifest = JSON.parse(fs.readFileSync(siteURL + '/manifest.json'));
		var icons = currentManifest.icons;

		var manifest = {
			"name": data.manifest_name || '',
			"short_name": data.manifest_short_name || '',
			"theme_color": data.manifest_theme_color || '',
			"background_color": data.manifest_background_color || '',
			"display": data.manifest_display || '',
			"orientation": data.manifest_orientation || '',
			"scope": data.manifest_scope || '',
			"description" : data.manifest_description || '',
			"start_url" : data.manifest_start_url || '',
			"lang" : data.manifest_lang || '',
			"icons": icons
		}		


		for(var key in file){

			let file_name = file[key].name;
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

			pwaImageSizes.forEach(function(format){
				manifest.icons.push({
					'src': 'media/pwa/'+realName + '-' + format.width + 'x' + format.height + '.' + extension,
					'sizes': format.width + 'x' + format.height,
					'type': 'image/' + extension
				});	
			})		

			var buffer = new Buffer.from(file[key].data.data)

			//uncomment await if you want to do stuff after the file is created

			rimraf(siteURL + '/media/pwa/' ,function () {
				if(!fs.existsSync(siteURL + '/media')){
					fs.mkdirSync(siteURL + '/media');
				}

				if(!fs.existsSync(siteURL + '/media/pwa')){
					fs.mkdirSync(siteURL + '/media/pwa');
				}

				fs.writeFile(siteURL + '/media/pwa/' + file_name, buffer,async (err) => {
					pwaImageSizes.forEach(function(format){
						imagemagick.resize({
						  srcPath: siteURL + '/media/pwa/' + file_name,
						  dstPath: siteURL + '/media/pwa/' + realName + '-' + format.width + 'x' + format.height + '.' + extension,
						  width:   format.width,
						  height:   format.height
						}, function(err, stdout, stderr){
						  	if (err) throw err;
						  	console.log('Resized '+realName+' to fit within ' + format.width + 'x' + format.height);
						});
					});
				});
			});
		};

		return manifest;	
	}

	static generateServiceWorker(siteURL,serviceWorkerType,offlinePage, cachedPages, customContent){
		if(serviceWorkerType!= '' && serviceWorkerType !== undefined){
			console.log("Generating Service Worker...");
			console.log("OfflinePage ->" + offlinePage);
			console.log("Cached Pages ->" + cachedPages);

			var serviceWorkerFile = '';


			switch(serviceWorkerType){

				case 'offline':
					serviceWorkerFile = fs.readFileSync('./server/service-worker-models/offline.js',"utf8");
					serviceWorkerFile = serviceWorkerFile.replace("{ToDo-replace-this-name.html}",offlinePage);
					break;
				case 'offline-copy-pages':
					serviceWorkerFile = fs.readFileSync('./server/service-worker-models/Offline copy of pages.js',"utf8")
					serviceWorkerFile = serviceWorkerFile.replace("{ToDo-replace-this-name.html}",offlinePage);
					break;
				case 'offline-copy-backup':
					serviceWorkerFile = fs.readFileSync('./server/service-worker-models/Offline copy with Backup offline page.js',"utf8")
					serviceWorkerFile = serviceWorkerFile.replace("{ToDo-replace-this-name.html}",offlinePage);
					break;
				case 'cache-first-network':
					serviceWorkerFile = fs.readFileSync('./server/service-worker-models/Cache-first network.js',"utf8")
					serviceWorkerFile = serviceWorkerFile.replace("{precacheFiles}",JSON.stringify(cachedPages));
					break;
				case 'advance-caching':
					serviceWorkerFile = fs.readFileSync('./server/service-worker-models/offline.js',"utf8")
					serviceWorkerFile = serviceWorkerFile.replace("{ToDo-replace-this-name.html}",offlinePage);
					serviceWorkerFile = serviceWorkerFile.replace("{precacheFiles}",JSON.stringify(cachedPages));
					break;
				case 'custom':
					serviceWorkerFile = customContent;
					break;
			}

			fs.writeFileSync(siteURL + '/service-worker.js', serviceWorkerFile);
		}
	}
}	