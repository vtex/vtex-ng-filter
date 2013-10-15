(function() {
  var config, moreOptionsShowFilters, openFilters;

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('ngFilter', ["ui.bootstrap.accordion"]).directive("filter", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/ng-filter.html' : 'ng-filter.html',
      link: function($scope) {
        var filter, item, _i, _j, _len, _len1, _ref, _ref1;
        _ref = $scope.filters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          if (!openFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            openFilters[filter.rangeUrlTemplate] = false;
          }
          if (!moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            moreOptionsShowFilters[filter.rangeUrlTemplate] = false;
          }
          filter.selectedCount = 0;
          _ref1 = filter.items;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            item = _ref1[_j];
            if (item.selected) {
              filter.selectedCount++;
            }
          }
          filter.selectedCountLabel = filter.selectedCount ? "(" + filter.selectedCount + ")" : "";
        }
        $scope.openFilters = openFilters;
        $scope.moreOptionsShowFilters = moreOptionsShowFilters;
        return $scope.clearAll = function() {
          var _k, _len2, _ref2, _results;
          _ref2 = $scope.filters;
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            filter = _ref2[_k];
            _results.push((function() {
              var _l, _len3, _ref3, _results1;
              _ref3 = filter.items;
              _results1 = [];
              for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                item = _ref3[_l];
                _results1.push(item.selected = false);
              }
              return _results1;
            })());
          }
          return _results;
        };
      }
    };
  }).provider('vtexNgFilter', {
    config: config,
    $get: function(filter) {
      return filter;
    }
  });

}).call(this);
