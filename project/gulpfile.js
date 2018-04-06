var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    cssimport = require('postcss-import'),
    cssmin = require('gulp-cssmin'),
    cssv = require('gulp-csslint'),
    cssvariables = require('postcss-css-variables'),
    colorfunction = require('postcss-color-function'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    htmlv = require('gulp-htmlhint'),
    imagemin = require('gulp-imagemin'),
    mqpacker = require('css-mqpacker'),
    nested = require('postcss-nested'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    pump = require('pump'),
    rename = require('gulp-rename'),
    simplevars = require('postcss-simple-vars'),
    slim = require('gulp-slim'),
    ssi = require('browsersync-ssi'),
    tinyping = require('gulp-tinypng-compress'),
    uglify = require('gulp-uglify');
 
// default
gulp.task('default', ['watch', 'browser-sync']);
 
// concat
gulp.task('css.concat', () => {
  var plugins = [
  colorfunction,
  cssimport,
  cssvariables,
  mqpacker,
  nested,
  simplevars
  ];
  gulp.src('docs/tmp/css/*.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(postcss(plugins))
  .pipe(autoprefixer({
    browsers: ['last 2 version'],
    grid: true
  }))
  .pipe(concat('s.css'))
  .pipe(gulp.dest('docs/tmp/concat'))
});
 
// cssmin
gulp.task('cssmin', ['css.concat'], () => {
  gulp.src('docs/tmp/concat/s.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('htdocs/css'))
  .pipe(browserSync.stream())
});
 
// css
gulp.task('css', ['css.concat', 'cssmin']);
 
// coffee
gulp.task('coffee', () => {
  gulp.src('docs/tmp/js/*.coffee')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(coffee({bare: true}))
  .pipe(gulp.dest('htdocs/js'))
  .pipe(browserSync.stream())
});
 
// uglify
gulp.task('jsmin', (cb) => {
  pump(
    [
      gulp.src('htdocs/js/*js'),
      uglify(),
      rename({suffix: '.min'}),
      gulp.dest('htdocs/js/min')
    ],
    cb
  );
});
 
// slim
gulp.task('slim', () => {
  gulp.src('docs/tmp/slim/*.slim')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(slim({
    require: 'slim/include',
    pretty: true,
    options: 'include_dirs=["docs/tmp/slim/inc"]'
  }))
  .pipe(gulp.dest('htdocs'))
  .pipe(browserSync.stream())
});
 
// watch
gulp.task('watch', () => {
  gulp.watch(['docs/tmp/css/*.css'], ['css']);
  gulp.watch(['docs/tmp/js/*.coffee'], ['coffee']);
  gulp.watch(['docs/tmp/slim/**/*.slim'], ['slim']);
});
 
// browser-sync
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: 'htdocs',
      middleware:[
        ssi({
          ext: '.html',
          baseDir: 'htdocs'
        })
      ]
    }
  });
});
 
// tinypng
gulp.task('tinypng', () => {
  gulp.src('docs/tmp/img/src/**/*.{png,jpg}')
    .pipe(tinyping({
      key: '__API_Key__'
      summarize: true
    }))
    .pipe(gulp.dest('docs/tmp/img/dist'))
});
 
// imagemin
gulp.task('imagemin', () => {
  gulp.src('docs/tmp/img/src/**/*.{png,jpg,gif,svg}')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 4}),
    imagemin.svgo({
      plugins: [
        {removeViewBox: false}
      ]
    })
  ]))
  .pipe(gulp.dest('docs/tmp/img/dist'))
});
 
// htmlhint
gulp.task('htmlv', () => {
  gulp.src('htdocs/*.html')
  .pipe(htmlv())
  .pipe(htmlv.reporter())
});
 
// csslint
gulp.task('cssv', () => {
  gulp.src('htdocs/css/s.min.css')
  .pipe(cssv({
    'adjoining-classes': false,
    'box-model': false,
    'box-sizing': false,
    'bulletproof-font-face': false,
    'compatible-vendor-prefixes': false,
    'empty-rules': true,
    'display-property-grouping': true,
    'duplicate-background-images': false,
    'duplicate-properties': true,
    'fallback-colors': false,
    'floats': false,
    'font-faces': false,
    'font-sizes': false,
    'gradients': false,
    'ids': false,
    'import': false,
    'important': false,
    'known-properties': true,
    'order-alphabetical': false,
    'outline-none': true,
    'overqualified-elements': false,
    'qualified-headings': false,
    'regex-selectors': false,
    'shorthand': false,
    'star-property-hack': false,
    'text-indent': false,
    'underscore-property-hack': false,
    'unique-headings': false,
    'universal-selector': false,
    'unqualified-attributes': false,
    'vendor-prefix': false,
    'zero-units': true
  }))
  .pipe(cssv.formatter('compact'))
});
