function Resource(type) {
	this.items = {};
	
	this.add = function(item) {
		if (item.constructor !== type) {
			throw "Whops! wrong type. Expected " + item.constructor.name;
		}
		this.items[item.name] = item;
	}
	
	this.remove = function(name) {
		delete this.items[name];
	}
	
	this.get = function(name) {
		return this.items[name];
	}
	
	this.list = function() {
		return this.items;
	}
}

function Product(name, price, amount) {
	this.name = name;
	this.price = price;
	this.amount = amount;
}

function Broker(name, secret, money) {
	this.name = name;
	this.secret = secret;
	this.money = money;
	this.wallet = new Resource(Product);
}

function Market() {
	this.brokers = new Resource(Broker);
	this.products = new Resource(Product);
	
	this.buy = function(broker_name, product_name, amount, unit_price_min, unit_price_max) {
		var prod = this.products.get(product_name);
		
		if ((prod.price < unit_price_min) || (prod.price > unit_price_max)) {
			throw "price "+prod.price+" outside the range "+unit_price_min+"-"+unit_price_max;
		}
		
		if (amount > prod.amount) {
			throw "trying to buy more ("+amount+") than available ("+prod.amount+")";
		}
		
		var cost = amount * prod.price;
		
		var broker = this.brokers.get(broker_name);
		if (cost > broker.money) {
			throw "not enough money ("+broker.money+") to buy (cost: "+cost+")";
		}
		
		var currently_owned = broker.wallet.get(prod.name);
		var curr_amount = currently_owned === undefined ? 0 : currently_owned.amount;
		if (-amount > curr_amount) {
			throw "trying to sell more ("+(-amount)+") than currently holding ("+curr_amount+")";
		}
		
		broker.money -= cost;
		prod.amount -= amount;
		var new_amount = curr_amount + amount;
		if (new_amount === 0 && currently_owned !== undefined) {
			broker.wallet.remove(prod.name);
		} else {
			broker.wallet.add(new Product(prod.name, prod.price, new_amount));
		}
	}
	
	this.sell = function(broker_name, product_name, amount, unit_price_min, unit_price_max) {
		this.buy(broker_name, product_name, -amount, unit_price_min, unit_price_max);
	}
}

exports.Resource = Resource;
exports.Product = Product;
exports.Broker = Broker;
exports.Market = Market;