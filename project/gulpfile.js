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
    connectSSI = require('connect-ssi'),
    htmlv = require('gulp-htmlhint'),
    imagemin = require('gulp-imagemin'),
    mqpacker = require('css-mqpacker'),
    nested = require('postcss-nested'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    simplevars = require('postcss-simple-vars'),
    slim = require('gulp-slim'),
    terser = require('gulp-terser');

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
  return gulp.src('docs/tmp/css/*.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(postcss(plugins))
  .pipe(autoprefixer({
    grid: 'autoplace'
  }))
  .pipe(concat('s.css'))
  .pipe(gulp.dest('docs/tmp/concat'))
});

// cssmin
gulp.task('cssmin', () => {
  return gulp.src('docs/tmp/concat/s.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('htdocs/css'))
  .pipe(browserSync.stream())
});

// css
gulp.task('css', gulp.series('css.concat', 'cssmin'));

// coffee
gulp.task('coffee', () => {
  return gulp.src('docs/tmp/js/*.coffee')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(coffee({bare: true}))
  .pipe(gulp.dest('htdocs/js'))
  .pipe(browserSync.stream())
});

// terser
gulp.task('jsmin', () => {
  return gulp.src('htdocs/js/*.js')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(terser())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('htdocs/js/min'))
});

// slim
gulp.task('slim', () => {
  return gulp.src('docs/tmp/slim/*.slim')
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
  gulp.watch('docs/tmp/css/*.css', gulp.task('css'));
  gulp.watch('docs/tmp/js/*.coffee', gulp.task('coffee'));
  gulp.watch('docs/tmp/slim/**/*.slim', gulp.task('slim'));
});

// browser-sync
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: 'htdocs',
      middleware: [
        connectSSI({
         ext: '.html',
         baseDir: 'htdocs'
        })
      ]
    }
  });
});

// imagemin
gulp.task('imagemin', () => {
  return gulp.src('docs/tmp/img/src/**/*.{png,jpg,gif,svg}')
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
  return gulp.src('htdocs/*.html')
  .pipe(htmlv())
  .pipe(htmlv.reporter())
});

// csslint
gulp.task('cssv', () => {
  return gulp.src('htdocs/css/s.min.css')
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

// default
gulp.task('default', gulp.parallel('watch', 'browser-sync'));
