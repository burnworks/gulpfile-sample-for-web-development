const { src, dest, watch, series, parallel } = require('gulp'),
      autoprefixer = require('gulp-autoprefixer'),
      babel = require('gulp-babel'),
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
      sourcemaps = require('gulp-sourcemaps'),
      terser = require('gulp-terser');

// concat
const taskCssconcat = (done) => {
  var plugins = [
  colorfunction,
  cssimport,
  cssvariables,
  mqpacker,
  nested,
  simplevars
  ];
  return src('docs/tmp/css/*.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(postcss(plugins))
  .pipe(autoprefixer({
    grid: 'autoplace'
  }))
  .pipe(concat('s.css'))
  .pipe(dest('docs/tmp/concat'));
  done();
}
exports.cssconcat = taskCssconcat;

// cssmin
const taskCssmin = (done) => {
  return src('docs/tmp/concat/s.css')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(dest('htdocs/css'))
  .pipe(browserSync.stream());
  done();
}
exports.cssmin = taskCssmin;

// coffee
const taskCoffee = (done) => {
  return src('docs/tmp/js/*.coffee')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(coffee({bare: true}))
  .pipe(dest('htdocs/js'))
  .pipe(browserSync.stream());
  done();
}
exports.coffee = taskCoffee;

// terser
const taskJsmin = (done) => {
  return src('htdocs/js/*.js')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(terser())
  .pipe(rename({suffix: '.min'}))
  .pipe(dest('htdocs/js/min'));
  done();
}
exports.jsmin = taskJsmin;

// slim
const taskSlim = (done) => {
  return src('docs/tmp/slim/*.slim')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(slim({
    require: 'slim/include',
    pretty: true,
    options: 'include_dirs=["docs/tmp/slim/inc"]'
  }))
  .pipe(dest('htdocs'))
  .pipe(browserSync.stream());
  done();
}
exports.slim = taskSlim;

// watch
const taskWatch = (done) => {
  watch('docs/tmp/css/*.css', series(taskCssconcat, taskCssmin));
  watch('docs/tmp/js/*.js', taskBabel);
  watch('docs/tmp/js/*.coffee', taskCoffee);
  watch('docs/tmp/slim/**/*.slim', taskSlim);
  done();
}
exports.watch = taskWatch;

// browser-sync
const taskServe = (done) => {
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
  done();
}
exports.serve = taskServe;

// imagemin
const taskImagemin = (done) => {
  return src('docs/tmp/img/src/**/*.{png,jpg,gif,svg}')
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
  .pipe(dest('docs/tmp/img/dist'));
  done();
}
exports.imagemin = taskImagemin;

// htmlhint
const taskHtmlv = (done) => {
  return src('htdocs/*.html')
  .pipe(htmlv())
  .pipe(htmlv.reporter());
  done();
}
exports.htmlv = taskHtmlv;

// csslint
const taskCssv = (done) => {
  return src('htdocs/css/s.min.css')
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
  .pipe(cssv.formatter('compact'));
  done();
}
exports.cssv = taskCssv;

// babel
const taskBabel = (done) => {
 src('docs/tmp/js/*.js')
  .pipe(plumber(
   { errorHandler: notify.onError('Error: <%= error.message %>') }
  ))
  .pipe(sourcemaps.init())
  .pipe(babel(
   { presets: ['@babel/preset-env'] }
  ))
  .pipe(concat('main.js'))
  .pipe(terser())
  .pipe(rename({suffix: '.min'}))
  .pipe(sourcemaps.write('maps'))
  .pipe(dest('htdocs/js'))
  .pipe(browserSync.stream());
  done();
}
exports.babel = taskBabel;

// default
exports.default = parallel(taskWatch, taskServe);

// css
exports.css = series(taskCssconcat, taskCssmin);
