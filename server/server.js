var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	rimraf = require("rimraf"),
	pug = require("pug"),
	html2pug = require('html2pug'),
	mung = require('express-mung');

var defaultSite = 'default';


/** Task to launch Api Server running on localhost:8082 */
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
    	res.setHeader("Access-Control-Expose-Headers","Pagination-Count");
    	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Accept-Language, Pagination-Count");
		next();
	});

	//Interceptamos la respuesta para agregarle globalmente paginacion
	app.use(mung.json(
	    function transform(body, req, res) {

			if(Array.isArray(body)){
		    	
		    	//Cabecera con el numero total de elementos antes de paginarlos
		    	res.set({'Pagination-Count': body.length})
		    	
		    	//Ordenacion global
		    	var filter_order = req.query.filter && req.query.filter.order ? req.query.filter.order : false;
		    	
		    	//Se puede agregar ASC o DESC al valor del filtro para que la ordenacion cambie de orden: filter[order]=nombre ASC
				if(filter_order){
		    		filter_order = filter_order.split(' ');
		    	}
		    	
		    	
		    	var orientation = filter_order.length > 1 && filter_order[1]=='DESC' ? filter_order[1] : 'ASC'

				if(filter_order[0] !== false){
					body = body.sort(function (a, b) {

						if(orientation == 'DESC'){
							if (a[filter_order[0]] < b[filter_order[0]]) {
								return 1;
							}
							if (a[filter_order[0]] > b[filter_order[0]]) {
								return -1;
							}
							// a must be equal to b
							return 0;
						}
						else{
							if (a[filter_order[0]] > b[filter_order[0]]) {
								return 1;
							}
							if (a[filter_order[0]] < b[filter_order[0]]) {
								return -1;
							}
							// a must be equal to b
							return 0;
						}	
					});
				}

				//Paginacion Global
				var filter_skip = req.query.filter && req.query.filter.skip ? req.query.filter.skip : 0;
				var filter_limit = req.query.filter && req.query.filter.limit > 0 ? req.query.filter.limit : body.length;
				var sliced_body = body.slice(filter_skip,parseInt(filter_skip)+parseInt(filter_limit));
		        return sliced_body;
		    }
		    else{
		    	return body;
		    }    
	    }
	));

	const layout = require('./layout.js');
	const theme = require('./theme.js');
	const site = require('./site.js');
	const page = require('./page.js');
	const content = require('./content.js');
	const component = require('./component.js');
	const chatbot = require('./chatbot.js');
	const mocks = require('./mocks.js');

	layout(app);
	theme(app);
	site(app);
	page(app);
	content(app);
	component(app);
	chatbot(app);
	mocks(app);

	app.listen(8082,function(req, res){
  		console.log('API running on 8082!');
	});



	appProcess = express();
	var router = express.Router();

	appProcess.use(bodyParser.urlencoded({ extended: false }));
	appProcess.use(bodyParser.json());

	appProcess.use(function(req, res, next) {

		var whiteList = ["https://localhost:8082","http://localhost:8083"]
  		var origin = req.headers.origin;

		if (whiteList.indexOf(origin) > -1) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		}

    	res.setHeader("Access-Control-Allow-Credentials", "true");
    	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    	res.setHeader("Access-Control-Expose-Headers","Pagination-Count");
    	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Accept-Language, Pagination-Count");
		next();
	});

	const processManager = require('./process.js');

	processManager(appProcess);

	appProcess.listen(8084,function(req, res){
  		console.log('API PROCESS running on 8084!');
	});

});