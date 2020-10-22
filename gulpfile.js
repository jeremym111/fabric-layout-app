const gulp = require('gulp');
const browserSync = require('browser-sync');
const server = browserSync.create();

function reload(done) {
    server.reload();
    done();
}

function serve(done) {
    server.init({
        server: {
            baseDir: './'
        }
    });
    done();
}

function watch(done) {
    gulp.watch(['scripts/**/*.js', '*.html', 'styles/**/*.css'], reload);
    done();
}

exports.default = gulp.series(serve, watch);
