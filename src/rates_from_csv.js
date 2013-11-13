/**
 * Sets rates from CSV file
 */
var csv = require('csv');
var Deferred = require('promised-io/promise').Deferred;
var rates_api = require('./rates_api.js');
var date = require('./date.js');

var csv_from_file = function(srcdir, path) {
    var deferred = new Deferred();
    csv().from.path(srcdir+'/'+path+'.csv').to.array(function(arr) {
        deferred.resolve({'path':path, 'data':arr});
    });
    return deferred.promise;
}

var csv_from_files = function(srcdir, paths) {
    var deferred = new Deferred();
    result = {};
    count = paths.length;
    for (p in paths) {
        csv_from_file(srcdir, paths[p]).then(function(data) {
            result[data.path] = data.data;
            count--;
            if (count == 0) {
                deferred.resolve(result);
            }
        })
    }
    
    return deferred.promise;
}

console.log('rates from csv');
if (process.argv.length < 8) {
    console.log('usage: node '+process.argv[1]+' <host> <port> <admin_key> <start_date> <srcdir> <list>');
    console.log('e.g. node '+process.argv[1]+' 127.0.0.1 3000 key 2011-01-01 ../resources/gpw "ACP,BHW,PEO,BRS,BRE,GTC,LTS,JSW,KER,KGH,LWB,PKN,PKO,PGE,PGN,PZU,SNS,TPE,TPS,EUR"')
    return 1;
}

var rest_host = process.argv[2];
var rest_port = process.argv[3];
var admin_token = process.argv[4];
var start_date = process.argv[5];
var srcdir = process.argv[6];
var list = process.argv[7].split(',');

get_by_date = function(date, where) {
    for (var k in where) {
        if (where[k][0] == date) {
            return where[k];
        }
    }
    
    return undefined;
}

wig20 = ['ACP', 'BHW', 'PEO', 'BRS', 'BRE', 'GTC', 'LTS', 'JSW', 'KER', 'KGH', 'LWB', 'PKN', 'PKO', 'PGE', 'PGN', 'PZU', 'SNS', 'TPE', 'TPS', 'EUR'];

csv_from_files(srcdir, list).then(function(data) {
    var rates = new rates_api.Rates(rest_host, rest_port, admin_token);
    var curr_date = date.parse(start_date);
    
    update_rates = function() {
        var out = {};
        for (var prod in data) {
            var prod_data = data[prod];
            var prod_bydate = get_by_date(date.format(curr_date), prod_data);
            if (prod_bydate) {
                out[prod] = parseFloat(prod_bydate[1].replace(',', '.'));
            }
        }
        console.log(date.format(curr_date), out);
        rates.set_rates(out);
        curr_date = date.add(curr_date, 1);
    }

    setInterval(update_rates, 1000);
});

