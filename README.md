FX-Market
=========

Simple market application where brokers can buy and sell stuff and stuff prices can go up and down.

Consists of following:
 - market server - runs an in-memory model of market and exposes REST API,
 - market REST API - set of APIs to play on market, such as buy, sell, set products prices,
 - market client - browser app utilising market API to show brokers and products ratings,
 - examples:
  - sample rates simulator - sample NodeJS app using market REST API to genereate FX rates,
  - sample broker bot API - sample NodeJS app using market REST API to buy/sell,
  - sample broker - sample NodeJS app using market REST API to buy/sell,
  
Usage
-----

1. start market server:

```
$ cd src
$ node rest_app.js
fx-market is listening on http://127.0.0.1:3000
admin_token = 8488422b-0621-4ccb-b455-70a32115cd21
```
    
2. start market client:

```
$ cd client
$ grunt server
``` 

3. start FX rates simulator:

```
$ cd src
$ node sim_rates.js 8488422b-0621-4ccb-b455-70a32115cd21
```

4. start FX market bot:

```
$ cd src
$ node broker_bot.js Joe secret
```

Market REST API
---------------

### GET /brokers
Returns list of registered brokers.

#### Example output
```
{
    "julek2": {
        "money": 11759.65583325062, 
        "name": "julek2", 
        "secret": "key1", 
        "wallet": {
            "items": {
                "BIT": {
                    "amount": 2519, 
                    "name": "BIT", 
                    "price": 2.074156779348995
                }, 
                "CHF": {
                    "amount": 2612, 
                    "name": "CHF", 
                    "price": 1.5
                }
            }
        }
    }
}
```

### POST /broker
Registers new broker with given name and secret token.

#### Example request
```
Content-Type: application/json
{
    "name": "joe",
    "secret": "abc"
}
```

#### Example output
```
{
    "money": 1000, 
    "name": "julek", 
    "secret": "abc", 
    "wallet": {
        "items": {}
    }
}
```

### GET /rates
Returns list of available products.

#### Example output
```
{
    "CHF": {
        "amount": 999999, 
        "name": "CHF", 
        "price": 1.5
    }, 
    "EUR": {
        "amount": 999999, 
        "name": "EUR", 
        "price": 1
    }
}
```

### POST /rates
Sets available products.

#### Example request
```
Content-Type: application/json
admin_token: 8488422b-0621-4ccb-b455-70a32115cd21
{
    "CHF": 4,
    "EUR": 9
}
```

### POST /buy
Performs a product purchase on behalf of authenticated broker

#### Example request
```
Content-Type: application/json
broker_name: julek
broker_secret: abc
{
    "product_name": "EUR",
    "amount": 9,
    "unit_price_min": 4.01,
    "unit_price_max": 4.03
}
```

Product purchase will be successful only if there's such product at given
amount available and it's unit price is between given min and max.


### POST /sell
Performs a product sale on behalf of authenticated broker

It works exactly the same as /buy with negative amount.