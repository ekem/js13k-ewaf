var fs = require('fs.extra');
var path = require('path');

var gulp = require('gulp');
var nomnom = require('nomnom');
var vinyl = require('vinyl');

var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var es = require('event-stream');
var htmlSrc = require('gulp-html-src');
var minifyHtml = require('gulp-minify-html');
var rename = require('gulp-rename');
var rm = require('gulp-rm');
var rsvg = require('gulp-rsvg');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');

gulp.task('watch', function() {
  gulp.run('build-dev');
  gulp.watch('app/**/*', ['build-dev']);
});

gulp.task('build', ['build.js', 'build.css', 'build.html']);

gulp.task('build.html', function() {
  return gulp.src('app/index.html')
    .pipe(minifyHtml())
    .pipe(gulp.dest('min'));
});

gulp.task('build.css', function() {
  return gulp.src('app/**/*.css')
    .pipe(concat('app.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('min'));
});

gulp.task('build.js', function() {
  return gulp.src('app/**/*.js')
    .pipe(uglify({
      compress: {
        unsafe: true,
     },
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('min'))
});

gulp.task('build-dev', ['build-dev.js', 'build-dev.css', 'build-dev.html']);

gulp.task('build-dev.html', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('dev'));
});

gulp.task('build-dev.css', function() {
  return gulp.src('app/**/*.css')
    .pipe(concat('app.css'))
    .pipe(gulp.dest('dev'));
});

gulp.task('build-dev.js', function() {
  return gulp.src('app/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dev'))
});

gulp.task('package', ['build'], function() {
  gulp.src('min/**/*')
    .pipe(zip('ewaf.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function() {
  gulp.src(['./dev/**/*', './min/**/*', './ewaf.zip'], {read: false})
    .pipe(rm());
});

function _serve() {
  var args = nomnom
   .option('port', {default: 8000})
   .option('host', {default: 'localhost'})
   .parse();
  return webserver({
    host: args.host,
    port: args.port,
  });
}

gulp.task('server-dev', ['build-dev'], function() {
  return gulp.src('dev').pipe(_serve());
});

gulp.task('server', ['build'], function() {
  return gulp.src('min').pipe(_serve());
});

gulp.task('dev', ['build-dev', 'watch', 'server-dev']);
gulp.task('default', ['build-dev']);
