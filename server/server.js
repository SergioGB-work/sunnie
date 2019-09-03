var gulp = require('gulp'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	rimraf = require("rimraf"),
	pug = require("pug"),
	html2pug = require('html2pug');

var defaultSite = 'default';


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

	const layout = require('./layout.js');
	const theme = require('./theme.js');
	const site = require('./site.js');
	const page = require('./page.js');
	const content = require('./content.js');
	const component = require('./component.js');
	const chatbot = require('./chatbot.js');

	layout(app);
	theme(app);
	site(app);
	page(app);
	content(app);
	component(app);
	chatbot(app);

	app.listen(8082,function(req, res){
  		console.log('API running on 8082!');
	});

});