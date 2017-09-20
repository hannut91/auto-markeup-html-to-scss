var gulp = require('gulp');
var exec = require('child_process').exec;

var htmlFile = '/Users/yunseok/Desktop/tests/test.html';
var scssFile = '/Users/yunseok/Desktop/tests/test.scss';

gulp.task('default', function() {
  // place code for your default task heren
});

gulp.task('run', function(cb){
  exec('node app.js '+ htmlFile + ' ' + scssFile,function(err, stdout, stderr){
    cb();
  })
})

gulp.task('watch', function(){
  gulp.watch(htmlFile, ['run'])
})