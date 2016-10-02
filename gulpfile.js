var gulp = require('gulp'),
    jade = require('gulp-jade');
    sass = require('gulp-sass');
	minifyCss = require('gulp-minify-css');
	minify = require('gulp-minify');
    concat = require('gulp-concat'); 
    rename = require('gulp-rename');
	uglify = require('gulp-uglify'); 	
	streamqueue  = require('streamqueue');	

var path = {
    jade: ['src/jade/**/*.jade'],
    html: 'public/',
	sass: ['src/sass/**/main.scss'],
	css: 'public/css/',
	js: ['src/javascript/*.js'],
	jsLibs: ['src/javascript/libs/*.js'],
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
		.pipe(minifyCss())
		.pipe(concat('main.css'))
		.pipe(rename({
			basename: 'main',
			extname: '.min.css'
		}))
		.pipe(gulp.dest(path.css))
});


gulp.task('compressJS', function() {  
    return streamqueue({ objectMode: true },
		gulp.src(path.jsLibs),
		gulp.src(path.js)
	)
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.jsDest))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDest));
});



gulp.watch('src/jade/**/*.jade', ['html']);
gulp.watch('src/sass/**/*.scss', ['styles']);
gulp.watch('src/javascript/**/*.js', ['compressJS']);