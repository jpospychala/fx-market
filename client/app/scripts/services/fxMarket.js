'use strict';

angular.module('clientApp')
  .service('Fxmarket', function Fxmarket($http, $timeout) {
      var that = this;
      that.history = {};
      that.rates = {};
      that.brokers_log = {};
      that.sampling_rate = 1000;
      
      var update_rate = function(currency, new_price) {
          if (!that.rates[currency]) {
              that.rates[currency] = {'price':new_price};
          } else {
              var old_price = that.rates[currency].price;
              that.rates[currency].delta = new_price - old_price;
              that.rates[currency].price = new_price;
          }
      };
      
      var log_and_rotate = function(log, key, new_entry, limit) {
          if (! log[key]) {
              log[key] = [new_entry];
          } else {
              log[key].push(new_entry);
              log[key].splice(0, log[key].length - limit);
          }
      }
      
      var get_rates = function() {
          $http.get('http://127.0.0.1:3000/rates').success(function(data, status, headers, config) {
              var new_rates = data;
              var timestamp = new Date();
              for (var currency in new_rates) {
                  var new_price = new_rates[currency].price;
                  
                  update_rate(currency, new_price);
                  log_and_rotate(that.history, currency, {'x':timestamp, 'y':new_price}, 100);
              }
          });
      };
      
      var broker_total_money = function(broker) {
          var m = broker.money;
          if ((broker.wallet) && (broker.wallet.items)) {
              for (var currency in broker.wallet.items) {
                  if (that.rates[currency]) {
                      var foreign_amount = broker.wallet.items[currency].amount;
                      var local_amount = foreign_amount * that.rates[currency].price;
                      m += local_amount;
                  }
              }
          }
          return m;
      };
      
      var get_brokers = function() {
          $http.get('http://127.0.0.1:3000/brokers').success(function(data, status, headers, config) {
              var new_brokers = data;
              var timestamp = new Date();
              for (var broker_name in new_brokers) {
                  var broker = new_brokers[broker_name];
                  var v = broker_total_money(broker);
                  
                  log_and_rotate(that.brokers_log, broker_name, {'x': timestamp, 'y':v}, 1000);
              }
          });
      };
      
      var sampling_loop = function() {
          get_rates();
          get_brokers();
          if (sampling_loop) {
              $timeout(sampling_loop, that.sampling_rate);
          }
      };
      
      sampling_loop();
  });
