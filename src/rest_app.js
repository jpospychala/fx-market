var uuid = require('node-uuid');
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

expect = function(obj, fields) {
    var res = {};
    for (f in fields) {
        var field = fields[f];
        if (obj[field] === undefined) {
            throw 'Required property '+field+' is missing';
        }
        res[field] = obj[field];
    }
    for (f in obj) {
        if (fields.indexOf(f) == -1) {
            throw 'Unknown property '+f+'. Expected only '+fields;
        }
    }
    return res;
}

get = function(fn) {
    return function(req, res) {
        try {
            var resp = fn();
            json(res, resp);
        } catch (ex) {
            json(res, {'error': ex});
        }
    }
};

post = function(modelProvider, handler) {
    return function(req, res) {
        try {
            var model = modelProvider(req.body, req);
            var resp = handler(model);            
            json(res, resp);
        } catch (ex) {
            json(res, {'error': ex});
        }
    }
};

has_admin_token = function(fn) {
    return function(req, res) {
        var req_admin_token = req.headers['admin_token'];
        if (ADMIN_TOKEN !== req_admin_token) {
            res.statusCode = 401;
            json(res, {'error': 'not authorized'});
            return;
        }
        return fn(req, res); 
    };
}

has_broker_secret = function(fn) {
    return function(req, res) {
        var req_broker_secret = req.headers['broker_secret'];
        var req_broker_name = req.headers['broker_name'];
        if (req_broker_secret && req_broker_name) {
            var broker = market.brokers.get(req_broker_name);
            if (broker && (broker.secret === req_broker_secret)) {
                return fn(req, res);
            }
        }
        res.statusCode = 401;
        json(res, {'error': 'not authorized ('+req_broker_secret+'/'+req.broker_name+')'});
    };
}

to_products = function(obj) {
    var prods = [];
    for (var name in obj) {
        var price = obj[name];
        prods.push(new model.Product(name, price, 999999));
    }
    return prods;
};

to_broker = function(dirty_obj) {
    var obj = expect(dirty_obj, ['name', 'secret']);
    return new model.Broker(obj.name, obj.secret, STARTING_MONEY);
};

to_transaction = function(dirty_obj, req) {
    var clean_obj = expect(dirty_obj, ['product_name', 'amount', 'unit_price_min', 'unit_price_max']);
    clean_obj['broker_name'] = req.headers['broker_name'];
    return clean_obj;
};

set_rates = function(prods) {
    market.products.addAll(prods);
    return market.products.list();
};

set_broker = function(broker) {
    if (market.brokers.get(broker.broker_name) === undefined) {
        market.brokers.add(broker);
    }
    return market.brokers.get(broker.name);
};

buy = function(tr) {
    market.buy(tr.broker_name, tr.product_name, tr.amount, tr.unit_price_min, tr.unit_price_max);
    return market.brokers.get(tr.broker_name);
};

sell = function(tr) {
    market.sell(tr.broker_name, tr.product_name, tr.amount, tr.unit_price_min, tr.unit_price_max);
    return market.brokers.get(tr.broker_name);
};

var PORT = 3000;
var ADMIN_TOKEN = uuid.v4(); 
var STARTING_MONEY = 1000;
var market = new model.Market();

app.post('/buy', has_broker_secret(post(to_transaction, buy)));
app.post('/sell', has_broker_secret(post(to_transaction, sell)));
app.get('/rates', get(function() {return market.products.list(); }));
app.post('/rates', has_admin_token(post(to_products, set_rates)));
app.get('/brokers', get(function() {return market.brokers.list(); }));
app.post('/broker', post(to_broker, set_broker));

console.log('fx-market is listening on http://127.0.0.1:'+PORT);
console.log('admin_token = '+ADMIN_TOKEN);
app.listen(PORT);