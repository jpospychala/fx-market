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
        var tmp = [];
        for (var currency in data) {
            if (model.rates[currency]) {
                var old_price = model.rates[currency].price;
                var new_price = data[currency].price;
                var delta = new_price - old_price;
                var old_delta = model.rates[currency].delta || 0;
                data[currency].delta = delta;
                var score = (old_delta > 0 ? 1 : 0) + delta;
                tmp.push({'delta':delta, 'delta2': old_delta, 'name':currency, 'score':score});
            }
        }
        model.sorted = tmp.sort(function(a, b) {return b.score-a.score });
        model.to_buy = model.sorted[0].name;
    }
    model.rates = data;
    model.rates.timestamp = new Date();
};

buy_and_sell = function() {
    console.log('model ', model);
    
    if (model.to_buy === undefined) {
        return;
    }
    
    if (Math.random() > 0.6) {
        var unit_price = model.rates[model.to_buy].price;
        var delta = model.rates[model.to_buy].delta;
        var upmin = unit_price - delta;
        var upmax = unit_price + delta;
        var amount = Math.floor(0.25* model.broker.money / unit_price);
        if (amount > 0) {
            broker_api.buy(broker_name, broker_secret, model.to_buy, amount, upmin, upmax).then(store_broker, error);
        }
    } else if (Math.random() > 0.5) {
        for (var c in model.broker.wallet.items) {
            if (c !== model.to_buy) {
                var amount = model.broker.wallet.items[c].amount;
                var price = model.rates[c].price;
                var delta = 100;
                broker_api.sell(broker_name, broker_secret, c, amount, price - delta, price + delta).then(store_broker, error);
            }
        }
    }
}

broker_loop = function() {
    broker_api.get_rates().then(function(data) {
        analyze_rates(data);
        buy_and_sell();
    }, error);
    
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