var Crawler = require("js-crawler");
var _ = require("underscore");
var elasticsearch = require('elasticsearch');

var Buffer = require('buffer').Buffer;
var Iconv = require('iconv').Iconv;

var client = new elasticsearch.Client({
    host: 'http://130.211.191.170:9200/'
});

var siteURL = process.argv[2];

try{
    var crawler = new Crawler().configure({maxRequestsPerSecond: 20, depth: 20});
    crawler.crawl({
        url: siteURL, success: function (page) {
            if (page.response.headers['content-type'].indexOf('windows-1251') > 1){
                saveWindows1251(page);
            } else {
                saveUTF8(page);
            }
        }, failure: function (page) {
            console.log('err', page.status);
        }
    });
} catch (e) {}

var req1 = /([а-яА-Я ,-\:]{15,}\?)/g;
var req2 = /(Как |Почему |Что |Когда |Кто |Какой |Чей |Каков |Который |Сколько |Где |Куда |Откуда |Зачем)[а-яА-Я ,-\:]{15,}\?*/g;
var saveUTF8 = function(page){
    var encodedBody = page.body.toString('utf8').match(req1);
    putInElastic(encodedBody, page.url);
    console.log(encodedBody);

    encodedBody = page.body.toString('utf8').match(req2);
    putInElastic(encodedBody, page.url);
    console.log(encodedBody);
    //console.log(encodedBody);
};

var saveWindows1251 = function(page){
    var body = new Buffer(page.body, 'binary');
    var conv = new Iconv('windows-1251', 'utf8');
    body = conv.convert(body).toString();
    var encodedBody = body.toString('utf8').match(req1);
    putInElastic(encodedBody, page.url);

    encodedBody = page.body.toString('utf8').match(req2);
    putInElastic(encodedBody, page.url);
};

var putInElastic = function(list, url){
    //console.log(url);
    var putArray = [];
    _.each(list, function(item, index){
        item = item.trim();
        var idBuf = new Buffer(item);
        var id = idBuf.toString('base64');
        var ind = { index:  { _index: 'crawler', _type: 'questions', _id: id } };
        var doc = { question : item, url: url, timestamp: Date.now()};
        putArray.push(ind);
        putArray.push(doc);
    });

    client.bulk({
        body: putArray
    }, function (err, resp) {

    });
};