'use strict';

describe('Service: Fxmarket', function () {

  // load the service's module
  beforeEach(module('ClientApp'));

  // instantiate service
  var Fxmarket;
  beforeEach(inject(function (_Fxmarket_) {
    Fxmarket = _Fxmarket_;
  }));

  it('should do something', function () {
    expect(!!Fxmarket).toBe(true);
  });

});
