require('events').EventEmitter.prototype._maxListeners = 100;

var gulp = require('gulp'),
    jade = require('gulp-jade'),
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
	modRewrite = require('connect-modrewrite');	
	fs = require('fs'),
	pathBundles = 'app/bundles/src',
	pathPlugins = 'app/plugins',
	pathPublic = 'app/public',
	pathBuild = 'app/build',
	sitesDefined=[];
	
var path = {
	
    sitesBundles: [pathBundles + '/sites/**/*.jade'],
	sitesPlugins: [pathPlugins + '/sites/**/*.jade'],
	
	sitesDeploy: [pathBuild+'/sites/**/*.jade'],
    sitesBuild: pathBuild + '/sites/',
	sitesPublic: pathPublic + '/',
	
	jadeBundlesLayouts: [pathBundles + '/layouts/**/*.jade'],
	jadePluginsLayouts: [pathPlugins + '/layouts/**/*.jade'],

	jadeBundlesComponents: [pathBundles + '/components/**/*.*'],
	jadePluginsComponents: [pathPlugins + '/components/**/*.*']

};

getSitesBundles();
getSitesPlugins();


var taskCSSBuild = [],
	taskJSBuild = [],
	taskIMAGESBuild = [],
	taskTEMPLATESBuild = [],
	taskLAYOUTSBuild = [],
	taskCOMPONENTSBuild = [];

for (var key in sitesDefined){
	
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
	
}

gulp.task('sitesBundles', function() {
    return gulp.src(path.sitesBundles)
    .pipe(gulp.dest(path.sitesBuild))
});

gulp.task('sitesPlugins',['sitesBundles'], function() {
    return gulp.src(path.sitesPlugins)
    .pipe(gulp.dest(path.sitesBuild))
});


/** THEME TASK **/
gulp.task('cssBuild', taskCSSBuild);

gulp.task('jsBuild', taskJSBuild);

gulp.task('imagesBuild', taskIMAGESBuild);

gulp.task('templatesBuild', taskTEMPLATESBuild);


/** BUILD TASKS **/
gulp.task('themesBuild', ['cssBuild','jsBuild','templatesBuild','imagesBuild']);

gulp.task('layoutsBuild', taskLAYOUTSBuild);

gulp.task('componentsBuild', taskCOMPONENTSBuild);

gulp.task('sitesBuild', ['sitesBundles','sitesPlugins']);


/** BUILD **/
gulp.task('build', ['sitesBuild','layoutsBuild','componentsBuild','themesBuild']);

/** CSS DEPLOY TASK **/
gulp.task('cssTheme',['cssBuild'], function() {
	for (var key in sitesDefined){	
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
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/css/'))
	}	
});

gulp.task('cssComponents',['componentsBuild'], function() {
	for (var key in sitesDefined){	
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
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/css/'))
	}		
});

gulp.task('fonts',['cssBuild'], function() {
	for (var key in sitesDefined){	
		gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/css/fonts/**/*.*')
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/css/fonts/'))
	}		
});


/** JS DEPLOY TASKS **/
gulp.task('jsTheme',['jsBuild'], function() {  
	for (var key in sitesDefined){
		streamqueue({ objectMode: true },
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/primaryLibs/**/[^_]*.js'),
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/libs/**/[^_]*.js'),
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/javascript/[^_]*.js')
		)
			.pipe(concat('main.js'))
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/javascript/'))
			.pipe(rename('main.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/javascript/'));
	}
});

gulp.task('jsComponents',['componentsBuild'], function() {  
    for (var key in sitesDefined){
		streamqueue({ objectMode: true },
			gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/components/**/[^_]*.js')
		)
			.pipe(concat('components.js'))
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/javascript/'))
			.pipe(rename('components.min.js'))
			.pipe(uglify())
				.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/javascript/'))
	}			
});


/**DEPLOY TASKS**/
gulp.task('cssDeploy', ['cssTheme','cssComponents','fonts']);

gulp.task('jsDeploy', ['jsTheme','jsComponents']);

gulp.task('imagesDeploy',['imagesBuild'], function() {
	for (var key in sitesDefined){	
		gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/theme/images/**/*.*')
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
			}))
			.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site + '/images/'))
	}		
});

gulp.task('sitesDeploy',['layoutsBuild','templatesBuild','componentsBuild','sitesBuild'], function() {
	for (var key in sitesDefined){		
		
		var  pathSite='';

		if(sitesDefined[key].site == 'default'){
			pathSite = pathBundles;
		}
		else{
			pathSite = pathPlugins;
		}
		
		
		gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/*.jade')
		.pipe(jade({
			pretty: true,
			basedir: pathBuild + '/sites/' + sitesDefined[key].site,
			locals: JSON.parse(fs.readFileSync(pathSite +'/sites/'+ sitesDefined[key].site +'/sitemap.json'))
		}))
		.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site))
	}	
});

/** DEPLOY **/
gulp.task('deploy', ['sitesDeploy','cssDeploy','jsDeploy','imagesDeploy']);

/** DEFAULT **/
gulp.task('default',['deploy','connect']);


/** CONNECT **/
gulp.task('connect', function() {
  connect.server({
	root: './app/public/sites/',
	middleware: function() {
	
		var rewriteRules = [];
		for (var key in sitesDefined){	
	
			var  pathSite='';

			if(sitesDefined[key].site == 'default'){
				pathSite = pathBundles;
			}
			else{
				pathSite = pathPlugins;
			}	
	
			var sitemap = JSON.parse(fs.readFileSync(pathSite +'/sites/'+ sitesDefined[key].site +'/sitemap.json'));
			var site = sitemap.site[0].url;	
			var pages = sitemap.pages;
			var urls = [];
			for(var i=0;i<pages.length;i++){
				urls = urls.concat(getURLs(pages[i],[]));	
			}
			
			for(var i=0;i<urls.length;i++){
				rewriteRules.push('^' + site + urls[i].url + site + urls[i].src + ' [L]');
			}
		}
		console.log(rewriteRules);
		
		return [
			modRewrite(rewriteRules)
		]	
	}	
  });
});

/** TESTING **/
gulp.task('test', function () {
  gulp.src('./tests/*.js')
    .pipe(jasmine())
    .on('error', notify.onError({
      title: 'Jasmine Test Failed',
      message: 'One or more tests failed, see the cli for details.'
    }));
});



/**************************FUNCTIONS******************************/
function createTaskCSSBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('cssBundles' + siteName, function() {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/css/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/css/'))
	});
}

function createTaskCSSPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('cssPlugins' + siteName,['cssBundles' + siteName], function() {
		return 	gulp.src(pathPlugins + '/themes/' + siteTheme + '/css/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/css/'))
	});
}

function createTaskJSBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('jsBundles' + siteName, function() {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/javascript/**/[^_]*.js')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/javascript/'))
	});
}

function createTaskJSPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('jsPlugins' + siteName,['jsBundles' + siteName], function() {
		return 	gulp.src(pathPlugins + '/themes/' + siteTheme + '/javascript/**/[^_]*.js')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/javascript/'))
	});
}

function createTaskIMAGESBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('imagesBundles' + siteName, function() {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/images/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/images/'))
	});
}

function createTaskIMAGESPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('imagesPlugins' + siteName,['imagesBundles' + siteName], function() {
		return 	gulp.src(pathPlugins + '/themes/' + siteTheme + '/images/**/*.*')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/images/'))
	});
}

function createTaskTEMPLATESBundles(siteName,siteTheme,siteParentTheme){
	gulp.task('templatesBundles' + siteName, function() {
		return gulp.src(pathBundles + '/themes/' + siteParentTheme + '/templates/**/*.jade')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/templates/'))
	});
}

function createTaskTEMPLATESPlugins(siteName,siteTheme,siteParentTheme){
	
	gulp.task('templatesPlugins' + siteName,['templatesBundles' + siteName], function() {
		return 	gulp.src(pathPlugins + '/themes/' + siteTheme + '/templates/**/*.jade')
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/theme/templates/'))
	});
}

function createTaskLAYOUTSBundles(siteName){
	gulp.task('layoutsBundles' + siteName, function() {
		return 	gulp.src(path.jadeBundlesLayouts)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/layouts/'))
	});
}

function createTaskLAYOUTSPlugins(siteName){
	
	gulp.task('layoutsPlugins' + siteName,['layoutsBundles' + siteName], function() {
		return 	gulp.src(path.jadePluginsLayouts)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/layouts/'))
	});
}


function createTaskCOMPONENTSBundles(siteName){
	gulp.task('componentsBundles' + siteName, function() {
		return 	gulp.src(path.jadeBundlesComponents)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/components/'))
	});
}

function createTaskCOMPONENTSPlugins(siteName){
	
	gulp.task('componentsPlugins' + siteName,['componentsBundles' + siteName], function() {
		return 	gulp.src(path.jadePluginsComponents)
		.pipe(gulp.dest(pathBuild + '/sites/' + siteName + '/components/'))
	});
}


function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

function getSitesBundles(){
	
	var sites = getDirectories(pathBundles + '/sites')
		
	for(var i in sites){
		
		var jsonSite = JSON.parse(fs.readFileSync(pathBundles +'/sites/' + sites[i] + '/build.json'));
		
		var jsonTheme =JSON.parse(fs.readFileSync(pathBundles +'/themes/' + jsonSite.theme + '/templates/build.json'));
		
		var newSite = {'site':sites[i],'theme':jsonSite.theme,'themeParent':jsonTheme.baseTheme}
		
		sitesDefined.push(newSite);
	}	
}

function getSitesPlugins(){
	
	var sites = getDirectories(pathPlugins + '/sites');
	var defaultThemes = getDirectories(pathBundles + '/themes');
	var jsonTheme;
	
	for(var i in sites){
		
		var jsonSite = JSON.parse(fs.readFileSync(pathPlugins +'/sites/' + sites[i] + '/build.json'));
		
		if(defaultThemes.indexOf(jsonSite.theme) <0){
			
			jsonTheme =JSON.parse(fs.readFileSync(pathPlugins +'/themes/' + jsonSite.theme + '/templates/build.json'));
		
		}
		else{
			
			jsonTheme =JSON.parse(fs.readFileSync(pathBundles +'/themes/' + jsonSite.theme + '/templates/build.json'));
			
		}
		var newSite = {'site':sites[i],'theme':jsonSite.theme,'themeParent':jsonTheme.baseTheme}
		
		sitesDefined.push(newSite);
	}	
}

function getURLs(json,urls){
	array = urls;	
	
	if(json.childs.length <= 0){
		array.push({"url":json.url,"src":json.src});
		return array;
	}
	
	else{
		array.push({"url":json.url,"src":json.src});
		for(var i=0;i<json.childs.length;i++){
			array.concat(getURLs(json.childs[i],array));
		}
		
		return array
	}
	
}