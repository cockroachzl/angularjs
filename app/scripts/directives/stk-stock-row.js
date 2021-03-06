'use strict';

angular.module('stockDogApp')
  .directive('stkStockRow', function ($timeout, QuoteService) {
    return {
      restrict: 'A', //restrict use as attribute
      //  When a directive uses this option, $compile will throw an error unless the specified controller is found.
      // The ^ prefix means that this directive searches for the controller on its parents
      // (without the ^ prefix, the directive would look for the controller on just its own element).
      require: '^stkStockTable',
      scope: {
        stock: '=',
        isLast: '=' //used to indicate whether the row is the last row
      },
      link: function ($scope, $element, $attrs, stockTableCtrl) {
        // Create tooltip for stock-row
        $element.tooltip({
          placement: 'left',
          title: $scope.stock.company.name
        });

        // Add this row to the TableCtrl
        stockTableCtrl.addRow($scope);

        // Register this stock with the QuoteService
        QuoteService.register($scope.stock);

        // Deregister company with the QuoteService on $destroy
        $scope.$on('$destroy', function () {
          stockTableCtrl.removeRow($scope);
          QuoteService.deregister($scope.stock);
        });

        // If this is the last `stock-row`, fetch quotes immediately
        if ($scope.isLast) {
          $timeout(QuoteService.fetch);
        }

        // Watch for changes in shares and recalculate fields
        $scope.$watch('stock.shares', function () {
          $scope.stock.marketValue = $scope.stock.shares *
            $scope.stock.lastPrice;
          $scope.stock.dayChange = $scope.stock.shares *
            parseFloat($scope.stock.change);
          $scope.stock.save();
        });
      }
    };
  });
