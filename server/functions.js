const fs = require('fs');
const rimraf = require("rimraf");

const variables = require("./variables.js");
const defaultSite = variables.defaultSite;

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
			if(element.childs.length > 0){
				pages.push({"id":element.id,"name":element.name,"position":position.join()});
				pages = pages.concat(functions.pagesList(element.childs,originalSiteMap));
			}
			else{
				pages.push({"id":element.id,"name":element.name,"position":position.join()});
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
}	