'use strict';

/**
 * @ngdoc directive
 * @name stockDogApp.directive:stkSignFade
 * @description
 * # stkSignFade
 */
angular.module('stockDogApp')
  .directive('stkSignFade', function ($animate, $timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var oldVal = null;
        attrs.$observe('stkSignFade', function (newVal){
          if (oldVal && oldVal == newVal) {
            return;
          }
          var oldPrice = parseFloat(oldVal);
          var newPrice = parseFloat(newVal);
          oldVal = newVal;
          if (oldPrice && newPrice) {
            var direction = newPrice - oldPrice >= 0 ? 'up' : 'down';
            $animate.addClass(element, 'change-' + direction);
            $timeout(function() {
              $animate.removeClass(element, 'change-' + direction);
            }, 2000);
          }
        });
      }
    };
  });
