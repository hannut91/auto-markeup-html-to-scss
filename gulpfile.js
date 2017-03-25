var gulp = require('gulp');
var exec = require('child_process').exec;

var htmlFile = '/Users/yoon/applicat/Appzet/appzetmobile/src/app/components/login/account-setting/account-setting.component.html';
var scssFile = '/Users/yoon/applicat/Appzet/appzetmobile/src/app/components/login/account-setting/account-setting.component.scss';

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