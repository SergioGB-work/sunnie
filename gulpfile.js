require('events').EventEmitter.prototype._maxListeners = 100;

let gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
	minifyCss = require('gulp-minify-css'),
	minify = require('gulp-minify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),	
	streamqueue  = require('streamqueue'),
	image  = require('gulp-image'),
	connect = require('gulp-connect'),
	jasmine = require('gulp-jasmine'),
	notify = require('gulp-notify'),
	flatten = require('gulp-flatten'),
	i18n = require('gulp-i18n-localize');
	clean = require('gulp-clean'),
	modRewrite = require('connect-modrewrite'),
	fs = require('fs'),
	argv = require('yargs').argv,
	runSequence = require('run-sequence'),
	proxy = require('http-proxy-middleware'),
	express = require('express'),
	requireDir = require('require-dir')
	bodyParser = require("body-parser"),
	pathModule = require('path'),
	pathBundles = 'app/bundles/src',
	pathPlugins = 'app/plugins',
	compression = require('compression');

	requireDir('server');

let argv_site = argv.site !== undefined ? argv.site : false;
let argv_page = argv.pag !== undefined ? argv.pag: '*.*';
let argv_env = argv.env !== undefined ? argv.env : '';
let argv_contentType = argv.contentType !== undefined ? argv.contentType : '';
let argv_contentID = argv.contentID !== undefined ? argv.contentID : '';

let developMode = argv_env == 'dev' ? true : false;

let src_site_deploy = argv_site ? argv_site + '/**' : '**';
let src_page_deploy = argv.pag + '.pug' || '*.pug';


var	pathPublic = argv_env == 'dev' ? 'app/development' : 'app/public',
	pathDevelopment = 'app/development',
	pathBuild = 'app/build',
	sitesDefined=[];

let path = {
	
    sitesBundles: [pathBundles + '/sites/'+src_site_deploy+'/*.*'],
	sitesPlugins: [pathPlugins + '/sites/'+src_site_deploy+'/*.*'],

    localeBundles: [pathBundles + '/sites/'+src_site_deploy+'/locale/**/*.*'],
	
	sitesDeploy: [pathBuild+'/sites/'+src_site_deploy+'/'+src_page_deploy],
    sitesBuild: argv_site ? pathBuild + '/sites/' + argv_site : pathBuild + '/sites/',
	sitesPublic: argv_site ? pathPublic + '/' + argv_site : pathPublic + '/',
	sitesDevelopment: argv_site ? pathDevelopment + '/' + argv_site : pathDevelopment + '/',
	
	pugBundlesLayouts: [pathBundles + '/layouts/**/*.pug'],
	pugPluginsLayouts: [pathPlugins + '/layouts/**/*.pug'],

	pugBundlesComponents: [pathBundles + '/components/**/**/**/*.*'],
	pugPluginsComponents: [pathPlugins + '/components/**/**/**/*.*'],
	
	localeBundlesComponents: [pathBundles + '/components/**/locale/**/*.*'],
	localePluginsComponents: [pathPlugins + '/components/**/locale/**/*.*'],

	pugBundlesFragments: [pathBundles + '/fragments/**/**/**/*.*'],
	pugPluginsFragments: [pathPlugins + '/fragments/**/**/**/*.*'],	
	
};

let langs = ['es','en'];

getSitesBundles();
getSitesPlugins();


let taskCSSBuild = [],
	taskJSBuild = [],
	taskIMAGESBuild = [],
	taskTEMPLATESBuild = [],
	taskLAYOUTSBuild = [],
	taskCOMPONENTSBuild = [],
	taskFRAGMENTSBuild = [],
	taskLOCALESBuild = [],
	taskLOCALES_COMPONENTSBuild = [];



for (let key in sitesDefined){

/**********************************CSS*************************************/	
    createTaskCSSBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskCSSPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskCSSBuild.push('cssBundles' + sitesDefined[key].site);
    taskCSSBuild.push('cssPlugins' + sitesDefined[key].site);
	
/**********************************JS*************************************/	

    createTaskJSBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskJSPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskJSBuild.push('jsBundles' + sitesDefined[key].site);
    taskJSBuild.push('jsPlugins' + sitesDefined[key].site);	
	
/**********************************IMAGES*************************************/	

    createTaskIMAGESBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskIMAGESPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskIMAGESBuild.push('imagesBundles' + sitesDefined[key].site);
    taskIMAGESBuild.push('imagesPlugins' + sitesDefined[key].site);

/**********************************TEMPLATES*************************************/

    createTaskTEMPLATESBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskTEMPLATESPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskTEMPLATESBuild.push('templatesBundles' + sitesDefined[key].site);
    taskTEMPLATESBuild.push('templatesPlugins' + sitesDefined[key].site);
	
/************************************LAYOUTS**************************************/

    createTaskLAYOUTSBundles(sitesDefined[key].site);
    createTaskLAYOUTSPlugins(sitesDefined[key].site);
    taskLAYOUTSBuild.push('layoutsBundles' + sitesDefined[key].site);
    taskLAYOUTSBuild.push('layoutsPlugins' + sitesDefined[key].site);	
	
/************************************COMPONENTS**************************************/	

    createTaskCOMPONENTSBundles(sitesDefined[key].site);
    createTaskCOMPONENTSPlugins(sitesDefined[key].site);
    taskCOMPONENTSBuild.push('componentsBundles' + sitesDefined[key].site);
    taskCOMPONENTSBuild.push('componentsPlugins' + sitesDefined[key].site);


/************************************FRAGMENTS**************************************/	

    createTaskFRAGMENTSBundles(sitesDefined[key].site);
    createTaskFRAGMENTSPlugins(sitesDefined[key].site);
    taskFRAGMENTSBuild.push('fragmentsBundles' + sitesDefined[key].site);
    taskFRAGMENTSBuild.push('fragmentsPlugins' + sitesDefined[key].site);    
	
/************************************LOCALES**************************************/	

    createTaskLOCALESBundles(sitesDefined[key].site);
    createTaskLOCALESPlugins(sitesDefined[key].site);
    taskLOCALESBuild.push('localesBundles' + sitesDefined[key].site);
    taskLOCALESBuild.push('localesPlugins' + sitesDefined[key].site);	
	
    createTaskLOCALES_COMPONENTSBundles(sitesDefined[key].site);
    createTaskLOCALES_COMPONENTSPlugins(sitesDefined[key].site);
    taskLOCALES_COMPONENTSBuild.push('localesComponentsBundles' + sitesDefined[key].site);
    taskLOCALES_COMPONENTSBuild.push('localesComponentsPlugins' + sitesDefined[key].site);
	
}

/** THEME TASK **/
function cssBuild(done){
	return gulp.series(taskCSSBuild)(done);
}

function themesBuild(done){
	return gulp.series(cssBuild,jsBuild,templatesBuild,imagesBuild)(done);
}

function jsBuild(done){
	return gulp.series(taskJSBuild)(done);
}

function imagesBuild(done){
	return gulp.series(taskIMAGESBuild)(done);
}

function templatesBuild(done){
	return gulp.series(taskTEMPLATESBuild)(done);
}

/** BUILD TASKS **/
function layoutsBuild(done){
	return gulp.series(taskLAYOUTSBuild)(done);
}

function componentsBuild(done){
	return gulp.series(taskCOMPONENTSBuild)(done);
}

function fragmentsBuild(done){
	return gulp.series(taskFRAGMENTSBuild)(done);
}

function sitesBuild(done){
	return gulp.series(sitesBundles,sitesPlugins)(done);
}

function localesBuild(done){
	return gulp.series(taskLOCALESBuild)(done);
}

function localesComponentsBuild(done){
	return gulp.series(taskLOCALES_COMPONENTSBuild)(done);
}

/** BUILD **/

function build(done){
	return gulp.series(sitesBuild,localesBuild,localesComponentsBuild,layoutsBuild,componentsBuild,fragmentsBuild,themesBuild)(done);
}


/***  CSS  ***/
function cssThemeFunction(done){
	for (let key in sitesDefined){
		for (let lang in langs){

			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/css/main.scss')
				.pipe(sass().on('error', sass.logError))
				.pipe(concat('main.css'))
				.pipe(rename({
					basename: 'main',
					extname: '.min.css'
				}))
				.pipe(minifyCss({
					keepSpecialComments: 0
				}))
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/css/'));
		}
	}
	done();
};

function cssComponentsFunction(done){
	for (let key in sitesDefined){	
		for (let lang in langs){
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/components/**/[^_]*.scss')
			.pipe(sass().on('error', sass.logError))
			.pipe(concat('components.css'))
			.pipe(rename({
				basename: 'components',
				extname: '.min.css'
			}))
			.pipe(minifyCss({
				keepSpecialComments: 0
			}))
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/css/'));
		}			
	}
	done();	
};

function cssTheme(done){
	return gulp.series(cssBuild,cssThemeFunction)(done);
}

function cssComponents(done){
	return gulp.series(componentsBuild,cssComponentsFunction)(done);
}

function deployCSS(done){
	return gulp.series(cssTheme,cssComponents,fonts)(done);
}


/** FONTS **/
function fonts(done){
	return gulp.series(fontsFunction)(done);
}

function fontsFunction(done){
	for (let key in sitesDefined){	
		for (let lang in langs){
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/css/fonts/**/*.*')
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/css/fonts/'))
		}				
	}
	done();		
};

/** JS **/

function jsTheme(done){
	return gulp.series(jsBuild,jsThemeFunction)(done);
}

function jsThemeFunction(done){
	for (let key in sitesDefined){
		let files = streamqueue({ objectMode: true },
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/primaryLibs/**/[^_]*.js'),
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/libs/**/[^_]*.js'),
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/[^_]*.js')
		);

		let priorityFiles = streamqueue({ objectMode: true },
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/priority/**/[^_]*.js'));
		let developFiles;
		if(developMode){
				developFiles = streamqueue({ objectMode: true },
				gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/develop/**/[^_]*.js'));
		}

		for (let lang in langs){

			let auxFiles = files.pipe(concat('main.js'))
			.pipe(i18n({
				localeDir: pathBuild + '/sites/' + sitesDefined[key].site + '/locale',
				locales: [langs[lang]],
				delimeters: ['${{','}}$']
			}))
			.pipe(rename('main.js'))
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));
			

			let auxPriorityFiles = priorityFiles.pipe(concat('priority.js'))
			.pipe(i18n({
				localeDir: pathBuild + '/sites/' + sitesDefined[key].site + '/locale',
				locales: [langs[lang]],
				delimeters: ['${{','}}$']
			}))
			.pipe(rename('priority.js'))			
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'))
			
			
			if(!developMode){

				auxFiles.pipe(rename('main.min.js'))
				.pipe(uglify())
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));

				auxPriorityFiles.pipe(rename('priority.min.js'))
				.pipe(uglify())
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));
			}

			if(developMode){
				developFiles.pipe(concat('develop.js'))
				.pipe(i18n({
					localeDir: pathBuild + '/sites/' + sitesDefined[key].site + '/locale',
					locales: [langs[lang]],
					delimeters: ['${{','}}$']
				}))
				.pipe(rename('develop.js'))
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'))
				.pipe(rename('develop.min.js'))
				.pipe(uglify())
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));			
			}
		}

	}

	done();
};

function jsComponents(done){
	return gulp.series(componentsBuild,jsComponentsFunction)(done);
}

function jsComponentsFunction(done){

	for (let key in sitesDefined){
		let files = streamqueue({ objectMode: true },
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/components/**/[^_]*.js')
		);

		for (let lang in langs){
			
			let auxFiles = files.pipe(concat('components.js'))
			.pipe(i18n({
				localeDir: pathBuild + '/sites/' + sitesDefined[key].site + '/locale',
				locales: [langs[lang]],
				delimeters: ['${{','}}$']
			}))
			.pipe(rename('components.js'))
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));



			if(!developMode){
				auxFiles.pipe(rename('components.min.js'))
				.pipe(i18n({
					localeDir: pathBuild + '/sites/' + sitesDefined[key].site + '/locale',
					locales: [langs[lang]],
					delimeters: ['${{','}}$']
				}))
				.pipe(rename('components.min.js'))	
				.pipe(uglify())
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript/'));
			}
		}		
	}

	done();	
};

function deployJS(done){
	return gulp.series(jsTheme,jsComponents)(done);
}


/** IMAGES **/
function imagesFunction(done){
	for (let key in sitesDefined){	
		let files = gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/images/**/*.*')
		  /*.pipe(image({
			  pngquant: true,
			  optipng: false,
			  zopflipng: true,
			  jpegRecompress: false,
			  jpegoptim: true,
			  mozjpeg: true,
			  gifsicle: true,
			  svgo: true,
			  concurrent: 10
			}))*/;

		for (let lang in langs){  
			files.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/images/'))
		}	
	}

	done();
}

function imagesCompressFunction(done){
	for (let key in sitesDefined){	
		let files = gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/images/**/*.*')
		  .pipe(image({
			  pngquant: true,
			  optipng: false,
			  zopflipng: true,
			  jpegRecompress: false,
			  jpegoptim: true,
			  mozjpeg: true,
			  gifsicle: true,
			  svgo: true,
			  concurrent: 10
			}));

		for (let lang in langs){  
			files.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/images/'))
		}	
	}

	done();

}

function deployImages(done){
	return gulp.series(imagesBuild,imagesFunction)(done);	
}


/** TEMPLATES **/


/** LAYOUTS **/


/** COMPONENTS **/

/** FRAGMENTS **/

/** SITES **/
function sitePluginsFunction(done){
	gulp.src(path.sitesPlugins)
    .pipe(gulp.dest(path.sitesBuild))
    .on('end', function() { done(); });
}

function sitesBundles(done){
	gulp.src(path.sitesBundles)
    .pipe(gulp.dest(path.sitesBuild))
    .on('end', function() { done(); });
}

function sitesPlugins(done){
	return gulp.series(sitesBundles,sitePluginsFunction)(done);
}

function deploySites(done){
	return gulp.series(localesBuild,localesComponentsBuild,layoutsBuild,templatesBuild,componentsBuild,fragmentsBuild,sitesBuild,sitesFunction,pagesBuild,mediaFunction)(done);
}

function sitesFunction(done){
	
	let siteDone = 0;

	for (let key in sitesDefined){
		
		let  pathSite='';

		if(sitesDefined[key].site == 'default'){
			pathSite = pathBundles;
		}
		else{
			pathSite = pathPlugins;
		}	
		
		let sitemap = JSON.parse(fs.readFileSync(pathBuild + '/sites/' + sitesDefined[key].site +'/sitemap.json'));
		
		sitemap = sitemap.pages;

		if(argv_page != '*.*'){
			sitemap = [findPage(sitemap,argv_page)];
			sitemap[0].childs = [];
		}
			
		buildPage(sitemap,developMode,sitesDefined[key]);
		
		gulp.src(pathBuild + '/sites/' + sitesDefined[key].site +'/sitemap.json')
		.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/data'))
		.on('end', function() {
			siteDone++;
			if(siteDone == sitesDefined.length * langs.length){
				done();
			}
		});

		for (let lang in langs){
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site +'/manifest.json')
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site  +'/'  + langs[lang]))
			.on('end', function() {
				siteDone++;
				if(siteDone == sitesDefined.length * langs.length){
					done();
				}
			})
		}
	}
}
function mediaFunction(done){
	let siteDone = 0;
	for (let key in sitesDefined){
		for (let lang in langs){
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site +'/media/*.*')
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/' + langs[lang] + '/media'))
			.on('end', function() {
				siteDone++;
				if(siteDone == sitesDefined.length){
					done();
				}
			
			});
		}
	}
}

function htaccess(done){
	buildRules();
	done();
};


function removeTMP(done){
	return gulp.series(deleteTMPFiles)(done);

};

/** LOCALES **/


/** CONNECT **/
function connectServer(done){
	
	app = express();
	let router = express.Router();
	let rules = buildRules();
	app.use(compression());

	app.get('*', function (req, res) {
		getSitesPlugins();
		let rules = buildRules();
		let url = rules[req.url.split('?')[0]];

		if(req.url.indexOf('/css/') >=0 || req.url.indexOf('/javascript/') >=0 || req.url.indexOf('/images/') >=0 || req.url.indexOf('/data/') >=0 || req.url.indexOf('/media/') >=0 || req.url.split('.').length > 1 ){
			url = req.url.split('?')[0];
			res.sendFile(url,{ root: pathModule.join(__dirname, './app/public/sites/') });
		}
		else{

			if(url !== undefined){//Si ya existe la ruta en el sitemap
				res.sendFile(url,{ root: pathModule.join(__dirname, './app/public/sites/') });
			}
			else{
				rules = buildRules();//Vuelve a cargar el sitemap por si hubiese alguna ruta nueva
				url = rules[req.url];
				if(url !== undefined){//Comprueba si la ruta solicitada existe y si no da un 404
					res.status(200).sendFile(url,{ root: pathModule.join(__dirname, './app/public/sites/') });
				}
				else{
					res.status(404).send();
				}	
			}
		}
	});	

	//console.log(app._router.stack);	
	app.listen(8080);
	done();
};

function connectDevServer(done){

	app = express();
	let router = express.Router();
	let rules = buildRules();
	app.use(compression());


	app.get('*', function (req, res) {
		getSitesPlugins();
		let rules = buildRules();
		
		
		if(req.url.indexOf('/css/') >=0 || req.url.indexOf('/javascript/') >=0 || req.url.indexOf('/data/') >=0 || req.url.indexOf('/images/') >=0 || req.url.indexOf('/media/') >=0 || req.url.split('.').length > 1 ){
				
			let folder = '';
			if(req.url.indexOf('/css/') >=0){
				url = req.url.split('/css/');
				folder = '/css';
			}	

			else if(req.url.indexOf('/javascript/') >=0){
				url = req.url.split('/javascript/');
				folder = '/javascript';
			}	

			else if(req.url.indexOf('/data/') >=0){
				url = req.url.split('/data/');
				folder = '/data';
			}

			else if(req.url.indexOf('/images/') >=0){
				url = req.url.split('/images/');
				folder = '/images';
			}

			else if(req.url.indexOf('/media/') >=0){
				url = req.url.split('/media/');
				folder = '/media';
			}

			else if((req.url.split('.').length) >=0 ){
				return res.sendFile(req.url,{ root: pathModule.join(__dirname, './app/development/sites/') });
			}
			console.log(req.url);
			console.log(url);
			let siteURL = rules[url[0] + folder] + '/' + url[1].split('?')[0];
			res.sendFile(siteURL,{ root: pathModule.join(__dirname, './app/development/sites/') });
		
		}

		else{
			let url = rules[req.url.split('?')[0]];

			if(url !== undefined){//Si ya existe la ruta en el sitemap
				res.sendFile(url,{ root: pathModule.join(__dirname, './app/development/sites/') });
			}
			else{
				rules = buildRules();//Vuelve a cargar el sitemap por si hubiese alguna ruta nueva
				url = rules[req.url];
				if(url !== undefined){//Comprueba si la ruta solicitada existe y si no da un 404
					res.status(200).sendFile(url,{ root: pathModule.join(__dirname, './app/development/sites/') });
				}
				else{
					res.status(404).send();
				}
			}
		}
	});	

	console.log('Dev Server on 8083');	
	app.listen(8083);
	done();
};

/** FUNCTIONS **/
function createTaskCSSBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('cssBundles' + siteName, () => {
		return gulp.src(pathBundles + '/themes/'+ siteParentTheme + '/css/**/*.*')
			.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/css/'));
	});
}

function createTaskCSSPlugins(siteName,siteTheme,siteParentTheme){
		
	gulp.task('cssPlugins' + siteName, () => {
		return gulp.src(pathPlugins + '/themes/' + siteTheme + '/css/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/css/'));
	});
}

function createTaskJSBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('jsBundles' + siteName, () => {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/javascript/**/[^_]*.js')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/javascript/'));
	});
}

function createTaskJSPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('jsPlugins' + siteName,() => {
		return gulp.src(pathPlugins + '/themes/' + siteTheme + '/javascript/**/[^_]*.js')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/javascript/'));
	});
}

function createTaskIMAGESBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('imagesBundles' + siteName, () => {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/images/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/images/'));
	});
}

function createTaskIMAGESPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('imagesPlugins' + siteName,() => {
		return gulp.src(pathPlugins + '/themes/' + siteTheme + '/images/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/images/'));
	});
}

function createTaskTEMPLATESBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('templatesBundles' + siteName, () => {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/templates/**/*.pug')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/templates/'));
	});
}

function createTaskTEMPLATESPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('templatesPlugins' + siteName, () => {
		return gulp.src(pathPlugins + '/themes/' + siteTheme + '/templates/**/*.pug')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/templates/'));
	});
}

function createTaskLAYOUTSBundles(siteName){
	gulp.task('layoutsBundles' + siteName, () => {
		return gulp.src(path.pugBundlesLayouts)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/layouts/'));
	});
}

function createTaskLAYOUTSPlugins(siteName){
	
	gulp.task('layoutsPlugins' + siteName, () => {
		return gulp.src(path.pugPluginsLayouts)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/layouts/'));
	});
}


function createTaskCOMPONENTSBundles(siteName){
	gulp.task('componentsBundles' + siteName, () => {
		return gulp.src(path.pugBundlesComponents)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/components/'));
	});
}

function createTaskCOMPONENTSPlugins(siteName){
	gulp.task('componentsPlugins' + siteName,() => {
		return gulp.src(path.pugPluginsComponents)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/components/'));
	});
}

function createTaskFRAGMENTSBundles(siteName){
	gulp.task('fragmentsBundles' + siteName, () => {
		return gulp.src(path.pugBundlesFragments)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/fragments/'));
	});
}

function createTaskFRAGMENTSPlugins(siteName){
	
	gulp.task('fragmentsPlugins' + siteName, () => {
		return gulp.src(path.pugPluginsFragments)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/fragments/'));
	});
}

function createTaskLOCALESBundles(siteName){
	gulp.task('localesBundles' + siteName, () => {
		return gulp.src(pathBundles + '/sites/' + 'default' + '/locale/**/*.*')
		.pipe(flatten({ includeParents: -1}))
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/locale/'));
	});
}

function createTaskLOCALESPlugins(siteName){
	gulp.task('localesPlugins' + siteName, () => {
		return gulp.src(pathPlugins + '/sites/' + siteName + '/locale/**/*.*')
		.pipe(flatten({ includeParents: -1}))
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/locale/'));
	});
}

function createTaskLOCALES_COMPONENTSBundles(siteName){
	gulp.task('localesComponentsBundles' + siteName, () => {
		return gulp.src(path.localeBundlesComponents)
		.pipe(flatten({ includeParents: -1}))
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/locale/'));
	});
}

function createTaskLOCALES_COMPONENTSPlugins(siteName){
	gulp.task('localesComponentsPlugins' + siteName, () => {
		return gulp.src(path.localePluginsComponents)
		.pipe(flatten({ includeParents: -1}))
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/locale/'));
	});
}


function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

function getSitesBundles(){
		
	let sites = argv_site ? [argv_site] : getDirectories(pathBundles + '/sites')

	for(let i in sites){
		if(JSON.parse(fs.existsSync(pathBundles +'/sites/' + sites[i] + '/build.json'))){
			let jsonSite = JSON.parse(fs.readFileSync(pathBundles +'/sites/' + sites[i] + '/build.json'));
			
			let jsonTheme =JSON.parse(fs.readFileSync(pathBundles +'/themes/' + jsonSite.theme + '/templates/build.json'));
			
			let newSite = {'site':sites[i],'theme':jsonSite.theme,'themeParent':jsonTheme.baseTheme}
			
			sitesDefined.push(newSite);
		}
	}
	return true;
}

function getSitesPlugins(){
	let sites = argv_site ? [argv_site] : getDirectories(pathPlugins + '/sites');
	let defaultThemes = getDirectories(pathBundles + '/themes');
	let jsonTheme;
	sitesDefined = sitesDefined[0] !== undefined ? [sitesDefined[0]] : [];

	for(let i in sites){
		if(JSON.parse(fs.existsSync(pathPlugins +'/sites/' + sites[i] + '/build.json'))){
			let jsonSite = JSON.parse(fs.readFileSync(pathPlugins +'/sites/' + sites[i] + '/build.json'));
			
			if(defaultThemes.indexOf(jsonSite.theme) <0){
				
				jsonTheme =JSON.parse(fs.readFileSync(pathPlugins +'/themes/' + jsonSite.theme + '/templates/build.json'));
			
			}
			else{
				
				jsonTheme =JSON.parse(fs.readFileSync(pathBundles +'/themes/' + jsonSite.theme + '/templates/build.json'));
				
			}
			let newSite = {'site':sites[i],'theme':jsonSite.theme,'themeParent':jsonTheme.baseTheme}
			
			sitesDefined.push(newSite);
		}	
	}
	return true;
}

function getURLs(json,urls){
	array = urls;	

	if(json.childs.length <= 0){
		array.push({"url":json.url,"src":json.src});
		return array;
	}
	
	else{
		array.push({"url":json.url,"src":json.src});

		for(let i=0;i<json.childs.length;i++){
			array.concat(getURLs(json.childs[i],array));
		}
		
		return array
	}
	
}

function findPage(pages , pageID){
	//let page = pages.filter(page => page.id == id)[0];
	let page = '';
	
	for( let i=0; i<pages.length; i++) {

		if(pages[i].childs.length > 0){
			page = findPage(pages[i].childs , pageID);
		}

		if(page != '' && page !== undefined){
			return page;
		}

		else if(pages[i].id == pageID){
			return pages[i];
		}
	};
}
/*
function buildPage(sitemap,development,site){
	for(let page in sitemap){

		let filename = sitemap[page].src.replace('/','').split('.');
		
		if(sitemap[page].layout != undefined){

			let sitemapFile = fs.readFileSync(pathBuild + '/sites/' + site.site +'/sitemap.json');
			
			gulp.src(pathBuild + '/sites/' + site.site + '/theme/templates/portal.pug')
			.pipe(pug({
				data: sitemap[page],
				cache: true,
				pretty: true,
				locals: Object.assign(JSON.parse(sitemapFile), {"development":development})
			}))
			.pipe(i18n({
				localeDir: pathBuild + '/sites/' + site.site + '/locale',
				locales: langs,
				delimeters: ['${{','}}$']
			}))
			.pipe(rename({
				basename: filename[0],
				extname: '.'+filename[1]
			}))
			.pipe(gulp.dest(pathPublic + '/sites/' + site.site));
		}	
		
		if(sitemap[page].childs != undefined && sitemap[page].childs.length > 0){
			buildPage(sitemap[page].childs,development,site);
		}
	}
}
*/
var taskPages = [];

function buildPage(sitemap,development,site){

	for(let page in sitemap){
		let filename = sitemap[page].src.replace('/','').split('.');
		
		if(sitemap[page].layout != undefined){
			createTaskPages(sitemap[page].id,sitemap[page],site.site,filename,development);
			taskPages.push('pageBuild' + sitemap[page].id);
			
		}	
		
		if(sitemap[page].childs != undefined && sitemap[page].childs.length > 0){
			taskPages.concat(buildPage(sitemap[page].childs,development,site));
		}
	}
	return taskPages;
}

function pagesBuild(done){
	console.log(taskPages);
	return gulp.parallel(taskPages)(done);
}

function createTaskPages(pageID,page,siteName,filename,development){

	gulp.task('pageBuild' + pageID, () => {
			
		let sitemapFile = fs.readFileSync(pathBuild + '/sites/' + siteName +'/sitemap.json');
		
		return gulp.src(pathBuild + '/sites/' + siteName + '/theme/templates/portal.pug')
		.pipe(pug({
			data: page,
			pretty: true,
			locals: Object.assign(JSON.parse(sitemapFile), {"development":development})
		}))
		.pipe(i18n({
			localeDir: pathBuild + '/sites/' + siteName + '/locale',
			locales: langs,
			delimeters: ['${{','}}$']
		}))
		.pipe(rename({
			basename: filename[0],
			extname: '.'+filename[1]
		}))
		.pipe(gulp.dest(pathPublic + '/sites/' + siteName));
	});
}




function buildRules(){
	let rewriteRules = {};
	let rewriteRulesApache = [];

	for (let key in sitesDefined){	
		
		let  pathSite='';

		if(sitesDefined[key].site == 'default'){
			pathSite = pathBundles;
		}
		else{
			pathSite = pathPlugins;
		}

		let sitemap = JSON.parse(fs.readFileSync(pathSite +'/sites/'+ sitesDefined[key].site +'/sitemap.json'));
		let site = sitemap.site.url != '/' ? sitemap.site.url : '';	
		let pages = sitemap.pages;
		let urls = [];

		for (let lang in langs){
			rewriteRules[site + '/' + langs[lang] + '/css']='/' + sitesDefined[key].site + '/' + langs[lang] + '/css';
			rewriteRules[site + '/' + langs[lang] + '/javascript']='/' + sitesDefined[key].site + '/' + langs[lang] + '/javascript';
			rewriteRules[site + '/' + langs[lang] + '/images']='/' + sitesDefined[key].site + '/' + langs[lang] + '/images';
			rewriteRules[site + '/' + langs[lang] + '/media']='/' + sitesDefined[key].site + '/' + langs[lang] + '/media';
			rewriteRules[site + '/data']='/' + sitesDefined[key].site + '/data';
		}
		

		for(let i=0;i<pages.length;i++){
			urls = urls.concat(getURLs(pages[i],[]));
		}
		
		for(let i=0;i<urls.length;i++){
			for (let lang in langs){
			//rewriteRules.push('^' + site + '/' + langs[lang] + urls[i].url + ' /' + sitesDefined[key].site + '/' + langs[lang] + urls[i].src + ' [L]');
			rewriteRules[site + '/' + langs[lang] + urls[i].url]='/' + sitesDefined[key].site + '/' + langs[lang] + urls[i].src;
			
			rewriteRulesApache.push('^' + langs[lang] + urls[i].url + '(.*)$ ' + langs[lang] + urls[i].src + '$1 [L]');
			}	
		}
	
		if (!fs.existsSync('extras')) {
			fs.mkdirSync('extras');
		}

		const writeStream = fs.createWriteStream(pathPublic + '/sites/' +sitesDefined[key].site+'/data/.htaccess');

		const pathName = writeStream.path;

		// write each value of the array on the file breaking line
		writeStream.write(`RewriteEngine On\n`);


		writeStream.write(`RewriteCond %{REQUEST_FILENAME} -f\n`);
		writeStream.write(`RewriteRule ^ - [L]\n`);


		writeStream.write(`RewriteRule ^es/css/(.*)$ en/css/$1 [L]\n`);
		writeStream.write(`RewriteRule ^en/css/(.*)$ en/css/$1 [L]\n`);

		writeStream.write(`RewriteRule ^es/javascript/(.*)$ en/javascript/$1 [L]\n`);
		writeStream.write(`RewriteRule ^en/javascript/(.*)$ en/javascript/$1 [L]\n`);

		writeStream.write(`RewriteRule ^es/images/(.*)$ en/images/$1 [L]\n`);
		writeStream.write(`RewriteRule ^en/images/(.*)$ en/images/$1 [L]\n`);

		writeStream.write(`RewriteRule ^es/media/(.*)$ en/media/$1 [L]\n`);
		writeStream.write(`RewriteRule ^en/media/(.*)$ en/media/$1 [L]\n`);

		writeStream.write(`RewriteRule ^data/(.*)$ data/$1 [L]\n`);
		writeStream.write(`RewriteRule ^data/(.*)$ data/$1 [L]\n`);

		rewriteRulesApache.sort(function (a, b) {
		    if (a > b) {
		        return -1;
		    }
		    if (b > a) {
		        return 1;
		    }
		    return 0;
		});

		rewriteRulesApache.forEach(value => writeStream.write(`RewriteRule ${value}\n`));

		// the finish event is emitted when all data has been flushed from the stream
		writeStream.on('finish', () => {

		});

		// handle the errors on the write process
		writeStream.on('error', (err) => {
			console.error(`Ha habido un error al generar el fichero .htaccess ${pathName} => ${err}`)
		});

		// close the stream
		writeStream.end();	
	}


	return rewriteRules;
}

function deleteTMPFiles(done){
	for (let key in sitesDefined){
 		gulp.src(pathPublic + '/sites/'+sitesDefined[key].site+'/*.*', {read: false})
    	.pipe(clean());

    	gulp.src(pathPublic + '/sites/'+sitesDefined[key].site+'/**/javascript/en', {read: false})
    	.pipe(clean());

    	gulp.src(pathPublic + '/sites/'+sitesDefined[key].site+'/**/javascript/es', {read: false})
    	.pipe(clean());

    	gulp.src(pathDevelopment + '/sites/'+sitesDefined[key].site+'/*.*', {read: false})
    	.pipe(clean());

    	gulp.src(pathDevelopment + '/sites/'+sitesDefined[key].site+'/**/javascript/en', {read: false})
    	.pipe(clean());

    	gulp.src(pathDevelopment + '/sites/'+sitesDefined[key].site+'/**/javascript/es', {read: false})
    	.pipe(clean());
    }
    done();
}

function deploy(done){
	return gulp.series(deploySites,deployCSS,deployJS,deployImages,htaccess,removeTMP)(done);
}

/*** EXPORTS o TASK publicas ***/
exports.deployCSS = deployCSS;
exports.deployJS = deployJS;
exports.deployImages = deployImages;
exports.deploySites = deploySites;
exports.deploy = deploy;

exports.connect = connectServer;
exports.connectDev = connectDevServer;

exports.default = gulp.parallel(deploy,connectServer,connectDevServer);


exports.build = build;
exports.cssComponents = cssComponents;
exports.sitesBuild = sitesBuild;
exports.sitesFunction = sitesFunction;
exports.removeTMP = removeTMP;