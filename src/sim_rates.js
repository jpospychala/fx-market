/**
 * Simulate rates - updates market rates by using it's REST API.
 */
var rates_api = require('./rates_api.js');

var counter = 0;
update_rates = function() {
    var chf = 1 + (counter % 4)*0.25;
    var usd = 5 - 0.5 * (Math.round(counter/4) % 2) + 0.5 * (Math.round((counter+3)/4) % 2);
    var eur = 1 + (Math.round(counter / 10) % 2)*2;
    var bit = 3 + 2*Math.sin(0.1*(counter+20));
    var sin2 = 2 + Math.sin(0.1*counter) * ((counter % 4)*0.25 + 1);
    rates.set_rates({'CHF':chf, 'USD':usd, 'EUR':eur, 'BIT':bit, 'SIN2': sin2});
    counter++;
}

console.log('simulate rates');
if (process.argv.length < 5) {
    console.log('usage: node '+process.argv[1]+' <host> <port> <admin_key>');
    return 1;
}

var rest_host = process.argv[2];
var rest_port = process.argv[3];
var admin_token = process.argv[4];
var rates = new rates_api.Rates(rest_host, rest_port, admin_token);
setInterval(update_rates, 1000);