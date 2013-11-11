/**
 * Rates API - NodeJS API for setting product prices in fx-market
 */
var http = require('http');

/**
 * Rates API entry point
 */
var Rates = function(rest_host, rest_port, admin_token) {
    
    var rest_post = function(path, obj) {
        var req = http.request({
            'hostname': rest_host,
            'port':rest_port,
            'path':path,
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

    /**
     * set_rates
     */
    this.set_rates = function(obj) {
        rest_post('/rates', obj);
    }
}

exports.Rates = Rates;