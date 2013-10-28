/**
 * Simulate rates - updates market rates by using it's REST API.
 */
var http = require('http');

rest_post = function(obj) {
    req = http.request({
        'hostname': '127.0.0.1',
        'port':'3000',
        'path':'/rates',
        'method':'POST'}, function(res) {});
    req.on('error', function(e) {
        console.log('problem with request', e);
    });
    req.setHeader('Content-Type', 'application/json');
    var dataStr = JSON.stringify(obj);
    req.write(dataStr);
    req.end();
};

var inc=0.01;
var chf = 1;
var usd = 2;
var eur = 3;

update_rates = function() {
    rest_post({'CHF':chf, 'USD':usd, 'EUR':eur});
    chf += inc;
    usd += inc;
    eur += inc;
}

console.log('simulate rates');
setInterval(update_rates, 1000)