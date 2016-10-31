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

var path = {
    jade: ['src/jade/*.jade'],
    html: 'public/',
	sass: ['src/sass/**/main.scss'],
	cssComponents: ['src/jade/components/**/[^_]*.scss'],
	css: 'public/css/',
	images: 'src/images/**/*.*',
	imagesDest: 'public/images/',
	js: ['src/javascript/[^_]*.js'],
	jsLibs: ['src/javascript/libs/[^_]*.js'],
	jsPrimaryLibs: ['src/javascript/primaryLibs/[^_]*.js'],
	jsDest: 'public/js/',
	jsComponents: 'src/jade/**/[^_]*.js',
	fonts: 'src/sass/fonts/*.*',
	fontsDest: 'public/css/fonts/'
};

gulp.task('connect', function() {
  connect.server();
});

gulp.task('html', function() {
    return gulp.src(path.jade)
    .pipe(jade({
        pretty: true
    }))
    .pipe(gulp.dest(path.html))
});

gulp.task('styles', function() {
	gulp.src(path.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('main.css'))
		.pipe(rename({
			basename: 'main',
			extname: '.min.css'
		}))
		.pipe(minifyCss({
            keepSpecialComments: 0
        }))		
		.pipe(gulp.dest(path.css))
});

gulp.task('cssComponents', function() {
	gulp.src(path.cssComponents)
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('components.css'))
		.pipe(rename({
			basename: 'components',
			extname: '.min.css'
		}))
		.pipe(minifyCss({
            keepSpecialComments: 0
        }))		
		.pipe(gulp.dest(path.css))
});

gulp.task('fonts', function() {
	gulp.src(path.fonts)
		.pipe(gulp.dest(path.fontsDest))
});


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

gulp.watch('src/jade/**/*.jade', ['html']);
gulp.watch('src/sass/**/*.scss', ['styles']);
gulp.watch('src/images/**/*.*', ['images']);
gulp.watch('src/javascript/**/*.js', ['compressJS']);