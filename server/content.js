const fs = require('fs');
const functions = require('./functions.js');
const rimraf = require("rimraf");
const path = require('path');

const variables = require("./variables.js");
const defaultSite = variables.defaultSite;
const fileUpload = require('express-fileupload');
const imagemagick = require('imagemagick');

/**
 * @module content
 */
module.exports = (app) => {

	/**
	* @function
	* GET service to obtain the list of content types of a site
	* @param {string} - idSite - Name of the site
	* @return {array} ARRAY with the content types names
	*/	
	app.get('/site/:id/content/contentTypes', function (req, res) {
		
		var site = req.params.id,
			siteURL = functions.getURLSite(site),
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

	/**
	* @function
	* GET service to obtain the detail of a content
	* @param {string} - idSite - Name of the site
	* @param {string} - contentType - Name of the contentType of the content
	* @param {string} - idContent - ID of the content
	* @return {json} JSON with the detail of the content
	*/	
	app.get('/site/:id/content/detail/:contentType/:idContent', function (req, res) {
		
		var site = req.params.id,
			siteURL = functions.getURLSite(site),
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

	/**
	* @function
	* GET service to obtain the detail of a content type
	* @param {string} - idSite - Name of the site
	* @param {string} - contentType - Name of the contentType
	* @return {json} JSON with the detail of the content type
	*/
	app.get('/site/:id/content/detail/:contentType', function (req, res) {
		
		var site = req.params.id,
			siteURL = functions.getURLSite(site),
			contentType = req.params.contentType,
			contentTypeConfig = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
			
		return res.status(200).send(contentTypeConfig);

	});	


	/**
	* @function
	* POST service to obtain the detail of a content type
	* @param {string} - idSite - Name of the site
	* @param {string} - contentType - Name of the contentType
	* @return {json} JSON with the detail of the content type
	*/
	app.post('/site/:id/content/detail', function (req, res) {
		
		var site = req.params.id,
			siteURL = functions.getURLSite(site),
			contentType = req.body.contentType,
			contentTypeConfig = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/config.json'));
			
		return res.status(200).send(contentTypeConfig);

	});	

	/**
	* @function
	* GET service to obtain a list of contents for a component, checking the content which the component is using at this moment
	* @param {string} - id - Name of the site
	* @param {string} - idComponent - ID of the component
	* @return {json} JSON with a list of contents
	*/
	app.get('/site/:id/contents/:idComponent', function (req, res) {
		
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var dirContentSite = [];
		var contents = [];
		var idComponent = req.params.idComponent;
		var sitemap = JSON.parse(fs.readFileSync(siteURL + '/sitemap.json').toString());
		var componentDetail = functions.getDetailComponentByID(idComponent, sitemap.pages);

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

	/**
	* @function
	* GET service to obtain a list of contents
	* @param {string} - id - Name of the site
	* @return {json} JSON with a list of contents
	*/
	app.get('/site/:id/contents', function (req, res) {
		
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var dirContentSite = [];
		var contents = [];

		var filter_contentType = req.query.filter && req.query.filter.where && req.query.filter.where.and[0] && req.query.filter.where.and[0].contentType ? req.query.filter.where.and[0].contentType : false;

		if(fs.existsSync(siteURL + '/content_manager')){
			dirContentSite = fs.readdirSync(siteURL + '/content_manager');
		}
		
		dirContentSite.forEach(function(contentType,index){

			if(contentType.split('.').length <= 1){
				fs.readdirSync(siteURL + '/content_manager/' + contentType).forEach(function(element,i){

					if(element.split('.').length <= 1 && element != 'empty_content'){
						
						var file = JSON.parse(fs.readFileSync(siteURL + '/content_manager/'+contentType+'/' + element + '/config.json'));
						file['contentType']= contentType;

						if(filter_contentType && file['contentType'] == filter_contentType){
							contents.push(file);
						}
						else if(!filter_contentType){
							contents.push(file);
						}
					}
				})
			}
		})

		var filter_order = req.query.filter && req.query.filter.order ? req.query.filter.order : 0;

		contents = contents.sort(function (a, b) {
			if (a[filter_order] > b[filter_order]) {
				return 1;
			}
			if (a[filter_order] < b[filter_order]) {
				return -1;
			}
			// a must be equal to b
			return 0;
		});

		return res.status(200).send(contents);
	});

	/**
	* @function
	* Service to create a new content
	* @param {string} - id - Name of the site
	* @param {string} - contentType - ContentType of the content
	* @param {number} - name - Name of the content
	*/
	app.post('/site/:id/content/add', function (req, res) {

		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
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

		functions.buildContentTemplate('--site ' + site + ' --contentType ' + contentType + ' --contentID ' + id , res)
	});

	/**
	* @function
	* Service to edit a content
	* @param {string} - id - Name of the site
	* @param {string} - contentType - ContentType of the content
	* @param {number} - name - Name of the content
	*/
	app.post('/site/:id/content/edit', function (req, res) {
		if(req.body.id != 'empty_content'){
			var site = req.params.id;
			var siteURL = functions.getURLSite(site);
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



			functions.execGulpTask('gulp buildContentTemplate --site '+site+' --contentType '+contentType+' --contentID ' + id + ' & gulp deploySites --env dev --site ' + site + ' & gulp removeTMP', res);
		};
	});

	/**
	* @function
	* Service to delete a content
	* @param {string} - id - Name of the site
	* @param {string} - id - ID of the content
	* @param {number} - contentType - Name of the content type
	*/
	app.post('/site/:id/content/delete', function (req, res) {
		if(req.body.id != 'empty_content'){
			var site = req.params.id;
			var contentId = req.body.id;
			var contentType = req.body.contentType;
			functions.deleteContent(site,contentId,contentType);
			functions.deploySites('--env dev --site ' + site, res);
		}
	});


	/**
	* @function
	* Service to add a content type
	* @param {string} - id - Name of the site
	* @param {string} - name - Name of the content type
	* @param {string} - template - Template code of the content type
	* @param {json} - config - JSON with the config of the content type
	*/
	app.post('/site/:id/content/contentType/add', function (req, res) {
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var contentTypeName = req.body.name.replace(/ /g, "");
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

	/**
	* @function
	* Service to modify a content type
	* @param {string} - id - Name of the site
	* @param {string} - name - Name of the content type
	* @param {string} - template - Template code of the content type
	* @param {json} - config - JSON with the config of the content type
	*/
	app.post('/site/:id/content/contentType/edit', function (req, res) {
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var contentTypeName = req.body.name;
		var contentTypeTemplate = req.body.template;
		var config = {"config":req.body.config};

		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/config.json', JSON.stringify(config,null,4),function(err){});
		fs.writeFileSync(siteURL + '/content_manager/'+contentTypeName+'/template.pug', contentTypeTemplate ,function(err){});
		
		functions.execGulpTask('gulp buildContentTemplate --site '+site+' --contentType '+contentTypeName+ ' & gulp deploySites --env dev --site ' + site + ' & gulp removeTMP', res);
		
	});

	/**
	* @function
	* Service to delete a content type, including his contents. If a component use a content that belongs to content type, his content is modified to default content and content type
	* @param {string} - id - Name of the site
	* @param {string} - contentTypeName - Name of the content type
	*/
	app.post('/site/:id/content/contentType/delete/', function (req, res) {
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
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
				functions.deleteContent(site,content,contentTypeName);
			}
		});	


		var includeContents = fs.readFileSync(siteURL + '/content_manager/include_contents.pug').toString();
		includeContents = includeContents.replace('include ./'+contentTypeName+'/mixin.pug','')
		fs.writeFileSync(siteURL + '/content_manager/include_contents.pug', includeContents,function(err){});

		rimraf(siteURL + '/content_manager/'+contentTypeName,function () {
			console.log("ELIMINADO TIPO CONTENIDO -> " + contentTypeName);
		});
		
		functions.deploySites('--env dev --site ' + site, res);
		
	});	

	/**
	* @function
	* GET service to obtain the detail of a content type
	* @param {string} - id - Name of the site
	* @param {string} - contentTypeName - Name of the content type
	* @return {json} JSON with the detail of the content type
	*/
	app.get('/site/:id/content/contentType/detail/:contentTypeName', function (req, res) {
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var contentTypeName = req.params.contentTypeName;

		var config = JSON.parse(fs.readFileSync(siteURL + '/content_manager/config.json'));
		var content = JSON.parse(fs.readFileSync(siteURL + '/content_manager/' + contentTypeName + '/config.json'));
		var template = fs.readFileSync(siteURL + '/content_manager/' + contentTypeName + '/template.pug').toString();
		


		return res.status(200).send(Object.assign(config,{"content":content},{"template":template},{"name":contentTypeName}));
		
	});

	/**
	* @function
	* GET service to obtain the general config for all the content types
	* @param {string} - id - Name of the site
	* @return {json} JSON with the config of all content types
	*/
	app.get('/site/:id/content/contentType/config', function (req, res) {
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var config = JSON.parse(fs.readFileSync(siteURL + '/content_manager/config.json'));
		
		return res.status(200).send(config);
		
	});


	/**
	* @function
	* GET service to obtain a list of media files
	* @param {string} - id - Name of the site
	* @return {json} JSON with a list of media files
	*/
	app.get('/site/:id/content/media', function (req, res) {
		
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var dirContentSite = [];
		var contents = [];

		if(fs.existsSync(siteURL + '/media')){
			dirContentSite = fs.readdirSync(siteURL + '/media');
		}

		else{
			fs.mkdirSync(siteURL + '/media');
			dirContentSite = fs.readdirSync(siteURL + '/media');
		}


		for(var index=0; index < dirContentSite.length; index++){

			var file = dirContentSite[index].split('.');
			var filename = dirContentSite[index];
			var file_details = {};
			var stats = fs.statSync(siteURL + '/media/' + filename);

			if(filename.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)){
				file_details["name"] = filename,
				file_details["size"] = stats.size,
				file_details["extension"] = path.extname(siteURL + '/media/' + filename);
				contents.push(file_details);
			}
		}

		return res.status(200).send(contents);
	});

	/**
	* @function
	* POST service to upload a media file
	* @param {string} - id - Name of the site
	* @param {file} - Array of files
	* @return {json} JSON with the filename uploaded
	*/

	app.post('/site/:id/content/media/upload', fileUpload() ,async function(req, res) {
		var file_name = '';

		try{
			var site = req.params.id;
			var siteURL = functions.getURLSite(site);
			var file = JSON.parse(JSON.stringify(req.files))

			console.log(req.files);

			Object.keys(file).forEach(function(el){

				file_name = file[el].name
				if(fs.existsSync(siteURL + '/media/' + file_name)){
					return res.status(200).send(
						{
							"filename":file_name,
							"error":{
								"code":"FILE_EXIST_ERROR"
							}
						}
					)
				}

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

				/*await*/
				fs.writeFile(siteURL + '/media/' + file_name, buffer, async(err) => {

					console.log("Successfully Written to File.");
					console.log("end  :  " + new Date())

				});

				fs.writeFile('app/development/sites/'+site+'/es/media/' + file_name, buffer, async(err) => {
					console.log("Successfully Written to File.");
					console.log("end  :  " + new Date())
				});
				fs.writeFile('app/development/sites/'+site+'/en/media/' + file_name, buffer, async(err) => {
					console.log("Successfully Written to File.");
					console.log("end  :  " + new Date())
				});				

				return res.status(200).send({"filename":file_name});
			});

			
		}
		catch(e){
			console.log(e);
			res.status(200).send(
				{
					"filename":file_name,
					"error":{
						"code":"FILE_UPLOAD_ERROR"								
					}
				}
			)
		};

	});

	/**
	* @function
	* POST service to delete a media file
	* @param {string} - id - Name of the site
	* @param {string} - filename - Name of the file to be deleted
	*/		

	app.post('/site/:id/content/media/delete', function (req, res) {

		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var filename = req.body.filename;

		if(!fs.existsSync(siteURL + '/media/' + filename)){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"FILE_DELETE_NOT_EXIST_ERROR"
				}
			)	
		}

		fs.unlinkSync(siteURL + '/media/' + filename);
		fs.unlinkSync('app/development/sites/'+site+'/es/media/' + filename);
		fs.unlinkSync('app/development/sites/'+site+'/en/media/' + filename);

		res.status(200).send();
	});

	/**
	* @function
	* GET service to obtain the detail of a media file
	* @param {string} - id - Name of the site
	* @param {string} - filename - Name of the media file
	* @return {json} JSON with the detail of the file
	*/	

	app.get('/site/:id/content/media/detail/:filename', function (req, res) {
		
		var site = req.params.id;
		var siteURL = functions.getURLSite(site);
		var filename = req.params.filename;
		var file_details = {}

		if(!fs.existsSync(siteURL + '/media/' + filename)){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"FILE_DETAIL_NOT_EXIST_ERROR"
				}
			)	
		}

		imagemagick.identify(siteURL + '/media/' + filename, function(err, features){
		
			file_details["width"] = features.width;
			file_details["height"] = features.height;
			file_details["format"] = features.format;
			file_details["dateCreate"] = features.properties["date:create"];
			var stats = fs.statSync(siteURL + '/media/' + filename);
			file_details["name"] = filename,
			file_details["size"] = stats.size,
			file_details["extension"] = path.extname(siteURL + '/media/' + filename),
			file_details["url_dev"] = 'pro',
			file_details["url_pro"] = 'dev';

			return res.status(200).send(file_details);			
		})

	});	

}