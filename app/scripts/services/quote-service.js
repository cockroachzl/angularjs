'use strict';

angular.module('stockDogApp')
  .service('QuoteService', function ($http, $interval) {
    var stocks = [];
    var BASE = 'http://query.yahooapis.com/v1/public/yql';

    // Handles updating stock model with appropriate data from quote
    var update = function (quotes) {
      console.log(quotes);
      if (quotes.length === stocks.length) {
        _.each(quotes, function (quote, idx) {
          var stock = stocks[idx];
          stock.lastPrice = parseFloat(quote.LastTradePriceOnly)
          if (!isMarketOpen()) {
            stock.lastPrice += _.random(-0.5, 0.5); //simulate fluctuation
          }
          stock.change = quote.Change;
          stock.percentChange = quote.ChangeinPercent;
          stock.marketValue = stock.shares * stock.lastPrice;
          stock.dayChange = stock.shares * parseFloat(stock.change);
          stock.save();
        });
      }
    };

    var isMarketOpen = function() {
      var now = new Date();
      var current_hour = now.getHours();
      var current_minutes = current_hour * 60 + now.getMinutes();
      var marketOpen = 9 *60 + 30;
      var marketClose = 16 * 60 + 30;
      if (current_minutes >= marketOpen && current_minutes <= marketClose) {
        return true;
      }
    }

    this.getStocks = function () {
      return stocks;
    }
    // Helper functions for managing which stocks to pull quotes for
    this.register = function (stock) {
      stocks.push(stock);
    };
    this.deregister = function (stock) {
      _.remove(stocks, stock);
    };
    this.clear = function () {
      stocks = [];
    };

    // Main processing function for communicating with Yahoo Finance API
    // TODO replace jsonp with regular get
    this.fetch = function () {
      var symbols = _.reduce(stocks, function (symbols, stock) {
        //symbols.push(stock.company.symbol);
        symbols.push(stock.company);
        return symbols;
      }, []);
      var query = encodeURIComponent('select * from yahoo.finance.quotes ' +
        'where symbol in (\'' + symbols.join(',') + '\')');
      var url = BASE + '?' + 'q=' + query + '&format=json&diagnostics=true' +
        '&env=http://datatables.org/alltables.env';
      var jsonpurl = url + '&callback=JSON_CALLBACK';
      console.log(jsonpurl);
      $http.jsonp(jsonpurl)
        .success(function (data) {
          if (data.query.count) {
            var quotes = data.query.count > 1 ?
              data.query.results.quote : [data.query.results.quote];
            update(quotes);
          }
        })
        .error(function (data) {
          console.log(data);
        });
    };

    // Used to fetch new quote data every 5 seconds
    $interval(this.fetch, 5000);
  });
