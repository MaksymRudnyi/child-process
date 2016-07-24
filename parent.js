const exec = require('child_process').exec;
exec('node crawler.js http://www.otvetnemail.ru/', function(error, stdout, stderr) {
    if (error) {
        console.error('exec error: ', error);
        return;
    }
    console.log('stdout: ', stdout);
    console.log('stderr: ', stderr);
});