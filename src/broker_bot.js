/**
 * Broker Bot - an example broker doing random investments
 */
var broker_api = require('./broker_api.js');

model = {};

error = function(data) {
    console.log('Error: '+data);
}

store_broker = function(data) {
    model.broker = data;
}

var analyze_rates = function(data) {
    if (model.rates) {
        var max_delta = -1;
        var max_delta_currency = undefined;
        for (var currency in data) {
            if (model.rates[currency]) {
                var old_price = model.rates[currency].price;
                var new_price = data[currency].price;
                var delta = new_price - old_price;
                data[currency].delta = delta;
                if (delta > max_delta) {
                    max_delta = delta;
                    max_delta_currency = currency;
                }
            }
        }
        model.to_buy = max_delta_currency;
    }
    model.rates = data;
    model.rates.timestamp = new Date();
};

broker_loop = function() {
    broker_api.get_rates().then(analyze_rates, error);
    
    if (!model.rates) {
        return;
    }
    
    console.log('model ', model);
    
    if (model.to_buy === undefined) {
        return;
    }
    
    var unit_price = model.rates[model.to_buy].price;
    var upmin = unit_price - 0.1;
    var upmax = unit_price + 0.1;
    var amount = Math.floor(model.broker.money / unit_price);
    if (amount > 0) {
        broker_api.buy(broker_name, broker_secret, model.to_buy, amount, upmin, upmax).then(store_broker, error);
    }
    
    for (var c in model.broker.wallet.items) {
        if (c !== model.to_buy) {
            broker_api.sell(c, model.broker.wallet.items[c].amount, 0, 1000).then(store_broker, error);
        }
    }
}

console.log('broker bot');
if (process.argv.length < 4) {
    console.log('usage: node '+process.argv[1]+' <name> <secret>');
    return 1;
}
var broker_name = process.argv[2];
var broker_secret = process.argv[3];

broker_api.register_broker(broker_name, broker_secret).then(function(resp) {
   model.broker = resp;
   setInterval(broker_loop, 1000);
});