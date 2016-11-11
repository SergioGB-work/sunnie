var gulp = require('gulp'),
    jade = require('gulp-jade');
    sass = require('gulp-sass');
	minifyCss = require('gulp-minify-css');
	minify = require('gulp-minify');
    concat = require('gulp-concat'); 
    rename = require('gulp-rename');
	uglify = require('gulp-uglify'); 	
	streamqueue  = require('streamqueue');	
	image  = require('gulp-image');	
	connect = require('gulp-connect');
	fs = require('fs');
var pathBundles = 'app/bundles/src';
var pathPlugins = 'app/plugins';
var pathPublic = 'app/public';
var pathBuild = 'app/build';
var themeBase = 'sun-theme';
var theme = 'mitema-theme';
var sitesDefined=[]; /*[{'site':'default','theme':'mitema-theme','themeParent':'sun-theme'},{'site':'miSite','theme':'mitema-theme','themeParent':'sun-theme'}];	*/
	
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
	
	var sites = getDirectories(pathPlugins + '/sites')
		
	for(var i in sites){
		
		var jsonSite = JSON.parse(fs.readFileSync(pathPlugins +'/sites/' + sites[i] + '/build.json'));
		
		var jsonTheme =JSON.parse(fs.readFileSync(pathPlugins +'/themes/' + jsonSite.theme + '/templates/build.json'));
		
		var newSite = {'site':sites[i],'theme':jsonSite.theme,'themeParent':jsonTheme.baseTheme}
		
		sitesDefined.push(newSite);
	}	
}

getSitesBundles();
getSitesPlugins();


gulp.task('connect', function() {
  connect.server();
});

/**********************************CSS*************************************/

var taskCSSBuild = [];

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

for (var key in sitesDefined)
{
    createTaskCSSBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskCSSPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskCSSBuild.push('cssBundles' + sitesDefined[key].site);
    taskCSSBuild.push('cssPlugins' + sitesDefined[key].site);
}


/**********************************JS*************************************/
var taskJSBuild = [];

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

for (var key in sitesDefined)
{
    createTaskJSBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskJSPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskJSBuild.push('jsBundles' + sitesDefined[key].site);
    taskJSBuild.push('jsPlugins' + sitesDefined[key].site);
}



/**********************************IMAGES*************************************/

var taskIMAGESBuild = [];

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

for (var key in sitesDefined)
{
    createTaskIMAGESBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskIMAGESPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskIMAGESBuild.push('imagesBundles' + sitesDefined[key].site);
    taskIMAGESBuild.push('imagesPlugins' + sitesDefined[key].site);
}

/**********************************TEMPLATES*************************************/
var taskTEMPLATESBuild = [];

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

for (var key in sitesDefined)
{
    createTaskTEMPLATESBundles(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    createTaskTEMPLATESPlugins(sitesDefined[key].site,sitesDefined[key].theme,sitesDefined[key].themeParent);
    taskTEMPLATESBuild.push('templatesBundles' + sitesDefined[key].site);
    taskTEMPLATESBuild.push('templatesPlugins' + sitesDefined[key].site);
}

/************************************LAYOUTS**************************************/

var taskLAYOUTSBuild = [];

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

for (var key in sitesDefined)
{
    createTaskLAYOUTSBundles(sitesDefined[key].site);
    createTaskLAYOUTSPlugins(sitesDefined[key].site);
    taskLAYOUTSBuild.push('layoutsBundles' + sitesDefined[key].site);
    taskLAYOUTSBuild.push('layoutsPlugins' + sitesDefined[key].site);
}



/************************************COMPONENTS**************************************/

var taskCOMPONENTSBuild = [];

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

for (var key in sitesDefined)
{
    createTaskCOMPONENTSBundles(sitesDefined[key].site);
    createTaskCOMPONENTSPlugins(sitesDefined[key].site);
    taskCOMPONENTSBuild.push('componentsBundles' + sitesDefined[key].site);
    taskCOMPONENTSBuild.push('componentsPlugins' + sitesDefined[key].site);
}


/************************************SITES**************************************/


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
		gulp.src(pathBuild + '/sites/' + sitesDefined[key].site + '/*.jade')
		.pipe(jade({
			pretty: true,
			basedir: pathBuild + '/sites/' + sitesDefined[key].site
		}))
		.pipe(gulp.dest(pathPublic + '/sites/' + sitesDefined[key].site))
	}	
});

/** DEPLOY **/
gulp.task('deploy', ['sitesDeploy','cssDeploy','jsDeploy','imagesDeploy']);

gulp.task('default',['deploy','connect']);
