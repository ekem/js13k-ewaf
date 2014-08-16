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

gulp.task('watch', ['build'], function() {
  gulp.watch('app/**/*', ['build']);
});

gulp.task('build', ['build.js', 'build.css', 'build.html']);

gulp.task('build.html', function() {
  return gulp.src('app/index.html')
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'));
});

gulp.task('build.css', function() {
  return gulp.src('app/**/*.css')
    .pipe(concat('app.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('dist'));
});

gulp.task('build.js', function() {
  return gulp.src('app/**/*.js')
    .pipe(uglify({
      compress: {
        unsafe: true,
     },
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist'))
});

gulp.task('package', ['build'], function() {
  gulp.src('dist/**/*')
    .pipe(zip('ewaf.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function() {
  gulp.src(['./dist/**/*', './ewaf.zip'], {read: false})
    .pipe(rm());
});

gulp.task('server', ['build'], function() {
  var args = nomnom
   .option('port', {default: 8000})
   .option('host', {default: 'localhost'})
   .parse();
  gulp.src('dist')
    .pipe(webserver({
      host: args.host,
      port: args.port,
    }));
});

gulp.task('dev', ['build', 'watch', 'server']);
gulp.task('default', ['build']);
