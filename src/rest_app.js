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

var market = new model.Market();

get = function(fn) {
    return function(req, res) {
        json(res, fn());
    }
};

to_products = function(obj) {
    var prods = [];
    for (var name in obj) {
        var price = obj[name];
        prods.push(new model.Product(name, price, 999999));
    }
    return prods;
};

to_broker = function(obj) {
    return new model.Broker(obj.name, obj.secret, obj.money);
}

to_transaction = function(obj) {
    return {
        'broker_name': obj.broker_name,
        'product_name': obj.product_name,
        'amount': obj.amount,
        'unit_price_min': obj.unit_price_min,
        'unit_price_max': obj.unit_price_max,
    };
}

set_rates = function(req, res) {
    var prods = to_products(req.body);
    market.products.addAll(prods);
    json(res, market.products.list());
};

set_broker = function(req, res) {
    var broker = to_broker(req.body);
    market.brokers.add(broker);
    json(res, market.brokers.get(broker.name));
};

buy = function(req, res) {
    var tr = to_transaction(req.body);
    market.buy(tr.broker_name, tr.product_name, tr.amount, tr.unit_price_min, tr.unit_price_max);
    json(res, market.brokers.get(tr.broker_name));
};

sell = function(req, res) {
    var tr = to_transaction(req.body);
    market.sell(tr.broker_name, tr.product_name, tr.amount, tr.unit_price_min, tr.unit_price_max);
    json(res, market.brokers.get(tr.broker_name));
};

app.post('/buy', buy);
app.post('/sell', sell);
app.get('/rates', get(function() {return market.products.list(); }));
app.post('/rates', set_rates);
app.get('/brokers', get(function() {return market.brokers.list(); }));
app.post('/broker', set_broker);

app.listen(3000);