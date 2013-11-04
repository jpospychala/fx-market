/**
 * Simulate rates - updates market rates by using it's REST API.
 */
var http = require('http');

rest_post = function(obj) {
    req = http.request({
        'hostname': '127.0.0.1',
        'port':'3000',
        'path':'/rates',
        'method':'POST'}, function(res) {
            if (res.statusCode != 200) {
                console.log(res.statusCode);
            }
        });
    req.on('error', function(e) {
        console.log('problem with request', e);
    });
    req.setHeader('admin_token', admin_token);
    req.setHeader('Content-Type', 'application/json');
    var dataStr = JSON.stringify(obj);
    req.write(dataStr);
    req.end();
};

var counter = 0;
update_rates = function() {
    var chf = 1 + (counter % 4)*0.25;
    var usd = 5 - 0.5 * (Math.round(counter/4) % 2) + 0.5 * (Math.round((counter+3)/4) % 2);
    var eur = 1 + (Math.round(counter / 10) % 2)*2;
    var bit = 3 + 2*Math.sin(0.1*(counter+20));
    var sin2 = 2 + Math.sin(0.1*counter) * ((counter % 4)*0.25 + 1);
    rest_post({'CHF':chf, 'USD':usd, 'EUR':eur, 'BIT':bit, 'SIN2': sin2});
    counter++;
}

console.log('simulate rates');
if (process.argv.length < 3) {
    console.log('usage: node '+process.argv[1]+' <admin_key>');
    return 1;
}
var admin_token = process.argv[2];
setInterval(update_rates, 1000);