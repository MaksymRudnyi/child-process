var express = require('express');
var app = express();

var formidable = require('formidable');
var util = require('util');

const exec = require('child_process').exec;

app.post('/crawl', function(req, res){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';

    form.parse(req, function(err, fields, files) {

        res.writeHead(200, {'content-type': 'text/plain'});
        res.end('start crawl: ' + JSON.stringify(fields));

        var maxBufferBytes = 1024 * 1024 * 1024;
        var tiimeOutMiliseconds = 1000 * 60 * 10;

        exec('node crawler.js ' + fields.url + ' ' + fields.elasticIp, [], {maxBuffer: maxBufferBytes, timeout: tiimeOutMiliseconds}, function(error, stdout, stderr) {
            if (error) {
                console.error('exec error: ', error);
                return;
            }
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);
        });

    });

});

var server = app.listen(8000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)
});
