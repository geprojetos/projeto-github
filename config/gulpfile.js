var gulp        = require('gulp');
var browserSync = require('browser-sync').create();


gulp.task('serve', function() {

    browserSync.init({
        server: "../docs"
    });

    gulp.watch("../docs/**/*").on('change', browserSync.reload);
});

gulp.task('start', ['serve']);