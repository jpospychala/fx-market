var model = require('../src/model.js');

var market, jacek, eur;

function setUp() {
	market = new model.Market();
	jacek = new model.Broker('jacek', 'key1', 10);
	eur = new model.Product('eur', 1, 10);
	market.brokers.add(jacek);
	market.products.add(eur);
}

function assert_initial_state(assert) {
	assert.eql(market.products.list(), {'eur':new model.Product('eur', 1, 10)});
	assert.eql(jacek.wallet.list(), {});
	assert.eql(jacek.money, 10);
}

exports['test_initial_state'] = function(beforeExist, assert) {
	setUp();
	assert_initial_state(assert);
}

exports['test_buy'] = function(beforeExist, assert) {
	setUp();
	
	market.buy(jacek.name, eur.name, 10, 1);
	assert.eql(market.products.list(), {'eur':new model.Product('eur', 1, 0)});
	assert.eql(jacek.wallet.list(), {'eur':new model.Product('eur', 1, 10)});
	assert.eql(jacek.money, 0);
}

exports['test_buy_not_available'] = function(beforeExist, assert) {
	setUp();
	
	assert.throws(function() {
		market.buy(jacek.name, eur.name, 100, 1);
	}, /trying to buy more \(100\) than available \(10\)/);
	assert_initial_state(assert);
}

exports['test_buy_price_outside_range'] = function(beforeExist, assert) {
	setUp();
	market.products.get(eur.name).price = 2;
	
	assert.throws(function() {
		market.buy(jacek.name, eur.name, 100, 1, 1);
	}, /price 2 outside the range 1-1/);
	
	market.products.get(eur.name).price = 1;
	assert_initial_state(assert);
}

exports['test_buy_price_outside_range_1'] = function(beforeExist, assert) {
	setUp();
	
	assert.throws(function() {
		market.buy(jacek.name, eur.name, 100, -1, 0);
	}, /price 1 outside the range -1-0/);
	
	market.products.get(eur.name).price = 1;
	assert_initial_state(assert);
}

exports['test_buy_price_outside_range_2'] = function(beforeExist, assert) {
	setUp();
	
	assert.throws(function() {
		market.buy(jacek.name, eur.name, 100, 2, 3);
	}, /price 1 outside the range 2-3/);
	
	market.products.get(eur.name).price = 1;
	assert_initial_state(assert);
}

exports['test_not_enough_money_to_buy'] = function(beforeExist, assert) {
	setUp();
	jacek.money = 1;
	
	assert.throws(function() {
		market.buy(jacek.name, eur.name, 10, 1, 1);
	}, /not enough money \(1\) to buy \(cost: 10\)/);
	
	jacek.money = 10;
	assert_initial_state(assert);
}

exports['test_sell'] = function(beforeExist, assert) {
	setUp();
	
	market.buy(jacek.name, eur.name, 10, 1);
	market.sell(jacek.name, eur.name, 10, 1);
	assert_initial_state(assert);
}

exports['test_sell_price_outside_range'] = function(beforeExist, assert) {
	setUp();
	market.buy(jacek.name, eur.name, 10, 1, 1);
	market.products.get(eur.name).price = 2;
	
	assert.throws(function() {
		market.sell(jacek.name, eur.name, 10, 1, 1);
	}, /price 2 outside the range 1-1/);
}

exports['test_trying_to_sell_more_than_holding'] = function(beforeExist, assert) {
	setUp();
	
	assert.throws(function() {
		market.sell(jacek.name, eur.name, 10, 1, 1);
	}, /trying to sell more \(10\) than currently holding \(0\)/);
}

exports['test_earn1'] = function(beforeExist, assert) {
	setUp();
	
	market.buy(jacek.name, eur.name, 10, 1);
	market.products.get(eur.name).price = 2;
	market.sell(jacek.name, eur.name, 10, 1);
	
	assert.equal(20, jacek.money);
}