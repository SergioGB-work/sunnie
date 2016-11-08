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

var pathBundles = 'app/bundles/src';
var pathPlugins = 'app/plugins';
var pathPublic = 'app/public';
var pathBuild = 'app/build';
var themeBase = 'sun-theme';
var theme = 'mitema-theme';
	
	
var path = {
    jadeBundlesPages: [pathBundles + '/pages/**/*.jade'],
	jadePluginsPages: [pathPlugins + '/pages/**/*.jade'],
	jadeBuildPages: [pathBuild + '/pages/**/*.jade'],
    pagesBuild: pathBuild + '/pages/',
	
	jadeBundlesLayouts: [pathBundles + '/layouts/**/*.jade'],
	jadePluginsLayouts: [pathPlugins + '/layouts/**/*.jade'],
	jadeBuildLayouts: [pathBuild + '/layouts/**/*.jade'],
	layoutsBuild: pathBuild + '/layouts/',
	
	jadeBundlesComponents: [pathBundles + '/components/**/*.*'],
	jadePluginsComponents: [pathPlugins + '/components/**/*.*'],
	jadeBuildComponents: [pathBuild + '/components/**/*.*'],
	componentsBuild: pathBuild + '/components/',	
	
    htmlPublic: pathPublic + '/pages/',
	
	cssBundles: [pathBundles + '/themes/'+ themeBase +'/css/**/*.*'],
	cssPlugins: [pathPlugins + '/themes/'+ theme +'/css/**/*.*'],	
	
	cssComponentsDeploy: [pathBuild+'/components/**/[^_]*.scss'],
	cssComponentsPublic: pathPublic + '/css/',
	
	cssBuild: pathBuild + '/themes/'+theme+'/css',
	cssPublic: pathPublic + '/css/',
	cssDeploy: [pathBuild+'/themes/'+theme+'/css/main.scss'],
	
	templatesBundles: [pathBundles + '/themes/'+ themeBase +'/templates/**/*.jade'],
	templatesPlugins: [pathPlugins + '/themes/'+ theme +'/templates/**/*.jade'],
	
	templatesBuild: pathBuild + '/themes/'+theme+'/templates',	
	
	imagesBundles: [pathBundles + '/themes/'+ themeBase +'/images/**/*.*'],
	imagesPlugins: [pathPlugins + '/themes/'+ theme +'/images/**/*.*'],
	
	imagesBuild: pathBuild + '/themes/'+theme+'/images',
	imagesPublic: pathPublic + '/images/',
	
	jsBundles: [pathBundles + '/themes/'+ themeBase +'/javascript/**/[^_]*.js'],
	jsPlugins: [pathBundles + '/themes/'+theme+'/javascript/**/[^_]*.js'],
	
	
	
	jsBundlesLibs: [pathBundles + '/themes/'+ themeBase +'/javascript/libs/**/[^_]*.js'],
	jsPluginsLibs: [pathPlugins + '/themes/'+theme+'/javascript/libs/**/[^_]*.js'],
	
	jsBundlesPrimaryLibs: [pathBundles + '/themes/'+ themeBase +'/javascript/primaryLibs/**/[^_]*.js'],
	jsPluginsPrimaryLibs: [pathPlugins + '/themes/'+theme+'/javascript/primaryLibs/**/[^_]*.js'],

	jsBundlesComponents: pathBundles + '/components/'+ themeBase +'/**/[^_]*.js',
	jsPluginsComponents: pathPlugins + '/components/'+theme+'/**/[^_]*.js',
	
	
	
	
	
	jsBuild: pathBuild + '/themes/'+theme+'/javascript',
	jsPublic: pathPublic + '/javascript/',
	
	fontsDeploy: [pathBuild+'/themes/'+theme+'/css/fonts/**/*.*'],
	fontsPublic: pathPublic + '/css/fonts/'
};

gulp.task('connect', function() {
  connect.server();
});

gulp.task('cssBundles', function() {
    return gulp.src(path.cssBundles)
    .pipe(gulp.dest(path.cssBuild))
});

gulp.task('cssPlugins',['cssBundles'], function() {
    return gulp.src(path.cssPlugins)
    .pipe(gulp.dest(path.cssBuild))
});

gulp.task('jsBundles', function() {
    return gulp.src(path.jsBundles)
    .pipe(gulp.dest(path.jsBuild))
});

gulp.task('jsPlugins',['jsBundles'], function() {
    return gulp.src(path.jsPlugins)
    .pipe(gulp.dest(path.jsBuild))
});

gulp.task('imagesBundles', function() {
    return gulp.src(path.imagesBundles)
    .pipe(gulp.dest(path.imagesBuild))
});

gulp.task('imagesPlugins',['imagesBundles'], function() {
    return gulp.src(path.imagesPlugins)
    .pipe(gulp.dest(path.imagesBuild))
});

gulp.task('templatesBundles', function() {
    return gulp.src(path.templatesBundles)
    .pipe(gulp.dest(path.templatesBuild))
});

gulp.task('templatesPlugins',['templatesBundles'], function() {
    return gulp.src(path.templatesPlugins)
    .pipe(gulp.dest(path.templatesBuild))
});

gulp.task('layoutsBundles', function() {
    return gulp.src(path.jadeBundlesLayouts)
    .pipe(gulp.dest(path.layoutsBuild))
});

gulp.task('layoutsPlugins',['layoutsBundles'], function() {
    return gulp.src(path.jadePluginsLayouts)
    .pipe(gulp.dest(path.layoutsBuild))
});

gulp.task('componentsBundles', function() {
    return gulp.src(path.jadeBundlesComponents)
    .pipe(gulp.dest(path.componentsBuild))
});

gulp.task('componentsPlugins',['componentsBundles'], function() {
    return gulp.src(path.jadePluginsComponents)
    .pipe(gulp.dest(path.componentsBuild))
});

gulp.task('pagesBundles', function() {
    return gulp.src(path.jadeBundlesPages)
    .pipe(gulp.dest(path.pagesBuild))
});

gulp.task('pagesPlugins',['pagesBundles'], function() {
    return gulp.src(path.jadePluginsPages)
    .pipe(gulp.dest(path.pagesBuild))
});


/** THEME TASK **/
gulp.task('cssBuild', ['cssBundles','cssPlugins']);

gulp.task('jsBuild', ['jsBundles','jsPlugins']);

gulp.task('imagesBuild', ['imagesBundles','imagesPlugins']);

gulp.task('templatesBuild', ['templatesBundles','templatesPlugins']);


/** BUILD TASKS **/
gulp.task('themesBuild', ['cssBuild','jsBuild','templatesBuild','imagesBuild']);

gulp.task('layoutsBuild', ['layoutsBundles','layoutsPlugins']);

gulp.task('componentsBuild', ['componentsBundles','componentsPlugins']);

gulp.task('pagesBuild', ['pagesBundles','pagesPlugins']);


/** BUILD **/
gulp.task('build', ['themesBuild','layoutsBuild','componentsBuild','pagesBuild']);

/** CSS DEPLOY TASK **/
gulp.task('cssTheme', function() {
	gulp.src(path.cssDeploy)
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('main.css'))
		.pipe(rename({
			basename: 'main',
			extname: '.min.css'
		}))
		.pipe(minifyCss({
            keepSpecialComments: 0
        }))		
		.pipe(gulp.dest(path.cssPublic))
});

gulp.task('cssComponents', function() {
	gulp.src(path.cssComponentsDeploy)
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('components.css'))
		.pipe(rename({
			basename: 'components',
			extname: '.min.css'
		}))
		.pipe(minifyCss({
            keepSpecialComments: 0
        }))		
		.pipe(gulp.dest(path.cssComponentsPublic))
});

gulp.task('fonts', function() {
	gulp.src(path.fontsDeploy)
		.pipe(gulp.dest(path.fontsPublic))
});


/** JS DEPLOY TASK **/
gulp.task('jsDeploy', function() {  
    return streamqueue({ objectMode: true },
		gulp.src(path.jsPrimaryLibs),
		gulp.src(path.jsLibs),
		gulp.src(path.js)
	)
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.jsDest))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDest));
});


/**DEPLOY TASKS**/
gulp.task('cssDeploy', ['cssTheme','cssComponents','fonts']);

gulp.task('jsDeploy', ['jsTheme','jsComponents']);


gulp.task('imagesDeploy', function() {

});

gulp.task('pagesDeploy', function() {

});

/** DEPLOY **/
gulp.task('deploy', ['cssDeploy','jsDeploy','imagesDeploy','pagesDeploy']);

/*
gulp.task('html', function() {
    return gulp.src(path.jadeBuildPages)
    .pipe(jade({
        pretty: true,
		basedir: pathBuild
    }))
    .pipe(gulp.dest(path.htmlPublic))
});

/*

gulp.task('compressJS', function() {  
    return streamqueue({ objectMode: true },
		gulp.src(path.jsPrimaryLibs),
		gulp.src(path.jsLibs),
		gulp.src(path.js)
	)
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.jsDest))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDest));
});

gulp.task('jsComponents', function() {  
    return streamqueue({ objectMode: true },
		gulp.src(path.jsComponents)
	)
        .pipe(concat('components.js'))
        .pipe(gulp.dest(path.jsDest))
        .pipe(rename('components.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDest));
});

gulp.task('images', function () {
  gulp.src(path.images)
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
    .pipe(gulp.dest(path.imagesDest));
});


gulp.task('default',['html', 'styles','cssComponents','fonts','compressJS','jsComponents','images','connect']);
*/
gulp.watch('src/jade/**/*.jade', ['html']);
gulp.watch('src/sass/**/*.scss', ['styles']);
gulp.watch('src/images/**/*.*', ['images']);
gulp.watch('src/javascript/**/*.js', ['compressJS']);