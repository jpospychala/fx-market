var model = require('../src/model.js');

exports['test_initial_state'] = function(beforeExist, assert) {
	var r = new model.Resource(model.Broker);
	assert.eql({}, r.list());
}

exports['type_safety'] = function(beforeExist, assert) {
	var broker = new model.Broker('jacek', 'pass', 10);
	assert.equal(model.Broker, broker.constructor);
}

exports['test_add'] = function(beforeExist, assert) {
	var r = new model.Resource(model.Product);
	var jacek = new model.Product('eur', 1, 1);
	r.add(jacek);
	assert.eql({'eur': {"name":"eur", "amount":1, "price":1}}, r.list());	
}

exports['test_remove'] = function(beforeExist, assert) {
	var r = new model.Resource(model.Product);
	r.add(new model.Product('eur', 1, 1));
	r.remove('eur');
	assert.eql({}, r.list());
}

exports['test_update'] = function(beforeExist, assert) {
	var r = new model.Resource(model.Product);
	r.add(new model.Product('eur', 1, 1));
	r.add(new model.Product('eur', 2, 1));
	assert.eql({'eur': {"name":"eur", "amount":1, "price":2}}, r.list());	
}

exports['test_add_wrong_type'] = function(beforeExist, assert) {
	var r = new model.Resource(model.Broker);
	assert.throws(function() {
		r.add(new model.Product('eur', '0.1'));
	});
}