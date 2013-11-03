/**
 * Broker Bot - an example broker doing random investments
 */
var http = require('http');
var Deferred = require('promised-io/promise').Deferred;

get = function(url) {
    var deferred = new Deferred();
    res_fn = function(res) {
        res.setEncoding('utf8');
        var all_data = '';
        res.on('data', function(data) {
            all_data += data;
        });
        res.on('end', function() {
            var obj = JSON.parse(all_data);
            if (obj.error) {
                deferred.reject(all_data);
            } else {
                deferred.resolve(obj);
            }
        });
    };
    
    req = http.request({
        'hostname': '127.0.0.1',
        'port':'3000',
        'path':url,
        'method':'GET'}, res_fn);
    req.on('error', function(e) {
        deferred.reject(e);
    });
    req.end();
    return deferred.promise;
};

post = function(url, obj, headers) {
    var deferred = new Deferred();
    res_fn = function(res) {
        res.setEncoding('utf8');
        var all_data = '';
        res.on('data', function(data) {
            all_data += data;
        });
        res.on('end', function() {
            var obj = JSON.parse(all_data);
            if (obj.error) {
                deferred.reject(all_data);
            } else {
                deferred.resolve(obj);
            }
        });
    };
    
    req = http.request({
        'hostname': '127.0.0.1',
        'port':'3000',
        'path':url,
        'method':'POST'}, res_fn);
    req.on('error', function(e) {
        deferred.reject(e);
    });
    if (headers) {
        for (var header_name in headers) {
            req.setHeader(header_name, headers[header_name]);
        }
    }
    req.setHeader('Content-Type', 'application/json');
    var dataStr = JSON.stringify(obj);
    req.write(dataStr);
    req.end();
    return deferred.promise;
};

exports.register_broker = function(name, secret) {
    console.log('registered '+name+' with secret '+secret);
    return post('/broker', {'name': name, 'secret':secret});
}

exports.get_rates = function() {
    return get('/rates');
}

exports.buy = function(broker_name, broker_secret, prod, amount, unit_price_min, unit_price_max) {
    console.log('buy');
    headers = {'broker_name': broker_name, 'broker_secret':broker_secret};
    return post('/buy', {'product_name':prod, 'amount': amount, 'unit_price_min':unit_price_min, 'unit_price_max':unit_price_max}, headers);
}

exports.sell = function(broker_name, broker_secret, prod, amount, unit_price_min, unit_price_max) {
    console.log('sell');
    headers = {'broker_name': broker_name, 'broker_secret':broker_secret};
    return post('/sell', {'product_name':prod, 'amount': amount, 'unit_price_min':unit_price_min, 'unit_price_max':unit_price_max}, headers);
}