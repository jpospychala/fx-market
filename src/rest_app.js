var express = require('express');
var model = require('./model.js');

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

app.configure(function() {
    app.use(allowCrossDomain);
    app.use(express.bodyParser());
})

json = function(res, object) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(object));
}

not_implemented = function(req, res){
    json(res, {'error':'not implemented'});
}

var market = new model.Market();

get = function(fn) {
    return function(req, res) {
        json(res, fn());
    }
}

get_rates = function(req, res){
    json(res, market.products.list());
}

get_brokers = function(req, res){
    json(res, market.brokers.list());
}

set_rates = function(req, res) {
    var obj = req.body;
    for (var name in obj) {
        var price = obj[name];
        market.products.add(new model.Product(name, price, 999999));
    }
    json(res, market.products.list());
}


app.get('/buy', not_implemented);
app.get('/sell', not_implemented);
app.get('/get_rates', get_rates);
app.post('/rates', set_rates);
app.get('/brokers', get_brokers);
app.post('/broker', not_implemented);

app.listen(3000);