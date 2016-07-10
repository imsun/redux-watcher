const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const concat = require('gulp-concat')

gulp.task('build', ['babel', 'pack', 'uglify'])

gulp.task('babel', () => {
	return gulp.src('./index.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('redux-watcher.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
})

gulp.task('pack', () => {
	return browserify({
		entries: 'dist/redux-watcher.js',
		debug: true,
		insertGlobals: true
	}).bundle()
		.pipe(source('redux-watcher.browser.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
})

gulp.task('uglify', () => {
	return gulp.src('dist/redux-watcher.browser.js')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
})
