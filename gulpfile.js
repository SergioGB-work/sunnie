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

var path = {
    jade: ['src/jade/*.jade'],
    html: 'public/',
	sass: ['src/sass/**/main.scss'],
	css: 'public/css/',
	images: 'src/images/**/*.*',
	imagesDest: 'public/images/',
	js: ['src/javascript/[^_]*.js'],
	jsLibs: ['src/javascript/libs/[^_]*.js'],
	jsPrimaryLibs: ['src/javascript/primaryLibs/[^_]*.js'],
	jsDest: 'public/js/'
};

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


gulp.task('default',['html', 'styles','compressJS','images']);

gulp.watch('src/jade/**/*.jade', ['html']);
gulp.watch('src/sass/**/*.scss', ['styles']);
gulp.watch('src/images/**/*.*', ['images']);
gulp.watch('src/javascript/**/*.js', ['compressJS']);