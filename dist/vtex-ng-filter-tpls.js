/*! vtex-ng-filter - v0.3.1 - 2014-10-26 */
(function() {
  var config, moreOptionsShowFilters, openFilters,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('vtexNgFilter', []).factory("Filter", function($translate) {
    var Filter;
    return Filter = (function() {
      function Filter(filter) {
        this.update = __bind(this.update, this);
        this.clearSelection = __bind(this.clearSelection, this);
        this.getSelectedItemsURL = __bind(this.getSelectedItemsURL, this);
        this.getSelectedItems = __bind(this.getSelectedItems, this);
        this.setSelectedItems = __bind(this.setSelectedItems, this);
        this.updateSelectedCount = __bind(this.updateSelectedCount, this);
        var k, v;
        for (k in filter) {
          v = filter[k];
          this[k] = v;
        }
        this.selectedCount = 0;
        if (this.type === 'date') {
          this.dateObjectCache = {};
          this.date = {};
          this.today = this.dateEndOfDay(new Date());
          this.setDates = (function(_this) {
            return function(offsetFrom, offsetTo, currentMonth) {
              var date;
              if (offsetFrom == null) {
                offsetFrom = 0;
              }
              if (offsetTo == null) {
                offsetTo = 0;
              }
              if (currentMonth == null) {
                currentMonth = false;
              }
              if ((currentMonth == null) || currentMonth === false) {
                date = {
                  from: moment().add('d', offsetFrom).toDate(),
                  to: moment().add('d', offsetTo).toDate()
                };
              } else {
                date = {
                  from: moment().startOf('month').toDate(),
                  to: moment().endOf('month').toDate()
                };
              }
              return _this.date = {
                from: _this.dateStartOfDay(date.from),
                to: _this.dateStartOfDay(date.to)
              };
            };
          })(this);
          this.dateRangeLabel = (function(_this) {
            return function() {
              if (_this.date.from && _this.date.to) {
                if (_this.dateStartOfDay(_this.date.from).toString() === _this.dateStartOfDay(new Date()).toString()) {
                  return $translate('listing.dates.today');
                } else if (moment(_this.date.from) === _this.dateStartOfDay(moment().add('d', -1)) && moment(_this.date.to).toISOString() === _this.dateEndOfDay(moment().add('d', -1)).toISOString()) {
                  return $translate('listing.dates.yesterday');
                } else if (moment(_this.date.from).isSame(moment().startOf('month').toDate()) && moment(_this.date.to).isSame(moment().endOf('month').toDate())) {
                  return $translate('listing.dates.currentMonth');
                } else if (_this.dateStartOfDay(_this.date.to).toISOString() === _this.dateStartOfDay(new Date()).toISOString()) {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($translate('listing.dates.untilToday'));
                } else {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($translate('listing.dates.until')) + " " + (moment(_this.date.to).add('hours', moment().hours()).fromNow());
                }
              } else {
                return $translate('listing.dates.noRangeSelected');
              }
            };
          })(this);
        }
        this.updateSelectedCount();
      }

      Filter.prototype.updateSelectedCount = function() {
        var i, item, lastSelectedItemIndex, selectedItemIndex, _i, _j, _len, _len1, _ref, _ref1;
        if (this.type === 'date') {
          this.selectedCount = this.date.from && this.date.to ? 1 : 0;
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            item = _ref[i];
            if (item.selected) {
              lastSelectedItemIndex = i;
            }
          }
          if (lastSelectedItemIndex > 4) {
            moreOptionsShowFilters[this.rangeUrlTemplate] = true;
          }
          this.selectedCount = (_.filter(this.items, function(i) {
            return i.selected;
          })).length;
        } else if (this.type === 'single') {
          _ref1 = this.items;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            item = _ref1[i];
            if (item === this.selectedItem) {
              selectedItemIndex = i;
            }
          }
          if (selectedItemIndex > 4) {
            moreOptionsShowFilters[this.rangeUrlTemplate] = true;
          }
          this.selectedCount = this.selectedItem ? 1 : 0;
        }
        if (this.selectedCount > 0) {
          openFilters[this.rangeUrlTemplate] = true;
        }
        return this.selectedCountLabel = this.selectedCount ? "(" + this.selectedCount + ")" : "";
      };

      Filter.prototype.setSelectedItems = function(itemsAsSearchParameter) {
        var date, item, items, _i, _len, _ref, _ref1;
        if (this.type === 'date') {
          items = itemsAsSearchParameter.replace(this.name + ':[', '').replace(']', '').split(' TO ');
          date = {
            from: new Date(items[0]),
            to: new Date(items[1])
          };
          this.date = date;
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            item.selected = (_ref1 = item.url, __indexOf.call(itemsAsSearchParameter.split(','), _ref1) >= 0);
          }
        } else if (this.type === 'single') {
          this.selectedItem = _.find(this.items, function(i) {
            return i.url === itemsAsSearchParameter;
          });
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.getSelectedItems = function() {
        var item, url, _base, _i, _len, _ref, _results;
        if (this.type === 'date') {
          if (this.date.from && this.date.to) {
            url = this.name + ":[" + this.dateStartOfDay(this.date.from).toISOString() + " TO " + this.dateEndOfDay(this.date.to).toISOString() + "]";
            (_base = this.dateObjectCache)[url] || (_base[url] = {
              name: this.dateRangeLabel(),
              url: url
            });
            return [this.dateObjectCache[url]];
          } else {
            return [];
          }
        } else if (this.type === 'multiple') {
          _ref = this.items;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.selected) {
              _results.push(item);
            }
          }
          return _results;
        } else if (this.type === 'single') {
          if (this.selectedItem) {
            return [this.selectedItem];
          } else {
            return [];
          }
        }
      };

      Filter.prototype.getSelectedItemsURL = function() {
        var selectedArray;
        selectedArray = _.map(this.getSelectedItems(), function(i) {
          return i.url;
        });
        if (selectedArray.length > 0) {
          return selectedArray.join(',');
        } else {
          return null;
        }
      };

      Filter.prototype.clearItem = function(itemObject) {
        var item, _i, _len, _ref, _ref1;
        if ((_ref = this.type) === 'date' || _ref === 'single') {
          return this.clearSelection();
        } else if (this.type === 'multiple') {
          _ref1 = this.items;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            if (itemObject.url === item.url) {
              item.selected = false;
            }
          }
          return this.updateSelectedCount();
        }
      };

      Filter.prototype.clearSelection = function() {
        var item, _i, _len, _ref;
        if (this.type === 'date') {
          this.date = {};
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            item.selected = false;
          }
        } else if (this.type === 'single') {
          this.selectedItem = null;
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.update = function(filterJSON) {
        var item, updatedItem, _i, _len, _ref, _ref1, _results;
        if (filterJSON == null) {
          filterJSON = this;
        }
        _ref = this.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          updatedItem = _.find(filterJSON.items, function(i) {
            return i.name === item.name;
          });
          if (updatedItem && ((_ref1 = this.getSelectedItems()) != null ? _ref1.length : void 0) === 0) {
            _results.push(item.quantity = updatedItem.quantity);
          } else {
            _results.push(item.quantity = 0);
          }
        }
        return _results;
      };

      Filter.prototype.dateStartOfDay = function(dateStr) {
        var date;
        date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date;
      };

      Filter.prototype.dateEndOfDay = function(dateStr) {
        var date;
        date = new Date(dateStr);
        date.setHours(23, 59, 59, 999);
        return date;
      };

      return Filter;

    })();
  }).directive("vtFilter", function($location) {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter.html' : 'vtex-ng-filter.html',
      link: function($scope) {
        var filter, filters, updateFiltersOnLocationSearch, _i, _len;
        filters = $scope.filters;
        for (_i = 0, _len = filters.length; _i < _len; _i++) {
          filter = filters[_i];
          if (!openFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            openFilters[filter.rangeUrlTemplate] = false;
          }
          if (!moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            moreOptionsShowFilters[filter.rangeUrlTemplate] = false;
          }
        }
        $scope.openFilters = openFilters;
        $scope.moreOptionsShowFilters = moreOptionsShowFilters;
        $scope.clearAll = function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
            filter = filters[_j];
            _results.push(filter.clearSelection());
          }
          return _results;
        };
        filters.getAppliedFilters = function() {
          return _.filter(filters, function(f) {
            return f.getSelectedItems().length > 0;
          });
        };
        filters.getAppliedItems = function() {
          return _.chain(filters.getAppliedFilters()).map(function(f) {
            return f.getSelectedItems();
          }).flatten().value();
        };
        updateFiltersOnLocationSearch = function() {
          var searchQuery, _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
            filter = filters[_j];
            searchQuery = $location.search()[filter.rangeUrlTemplate];
            if (searchQuery) {
              filter.setSelectedItems(searchQuery);
              _results.push(filter.update());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        updateFiltersOnLocationSearch();
        $scope.$on('$locationChangeSuccess', function() {
          var queryFilters, selectedFilters;
          queryFilters = (_.map(filters, function(f) {
            return $location.search()[f.rangeUrlTemplate];
          })).join();
          selectedFilters = (_.map(filters, function(f) {
            return f.getSelectedItemsURL();
          })).join();
          if (queryFilters === selectedFilters) {
            return;
          }
          return updateFiltersOnLocationSearch();
        });
        return _.each(filters, function(filter, i) {
          return $scope.$watch((function(scope) {
            return scope.filters[i].getSelectedItemsURL();
          }), function(newValue, oldValue) {
            var _j, _len1;
            if (newValue === oldValue) {
              return;
            }
            for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
              filter = filters[_j];
              $location.search(filter.rangeUrlTemplate, filter.getSelectedItemsURL());
            }
            return $location.search('page', 1);
          });
        });
      }
    };
  }).directive("vtFilterSummary", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter-summary.html' : 'vtex-ng-filter-summary.html'
    };
  }).directive("vtFilterButton", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters',
        openFilters: '&'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter-button.html' : 'vtex-ng-filter-button.html',
      link: function($scope) {}
    };
  }).provider('vtexNgFilter', {
    config: config,
    $get: function(filter) {
      return filter;
    }
  });

}).call(this);

angular.module("vtexNgFilter").run(function($templateCache) {   'use strict';

  $templateCache.put('vtex-ng-filter-button.html',
    "<a class=\"btn\" href=\"javascript:void(0);\" ng-click=\"openFilters()\"><i class=\"icon-filter\" ng-class=\"{'icon-blue': filters.getAppliedItems().length > 0}\"></i>&nbsp; <span translate=\"\">listing.filters</span> <span class=\"badge badge-info badge-corner\" data-ng-show=\"filters.getAppliedItems().length > 0\">{{filters.getAppliedItems().length}}</span></a>"
  );


  $templateCache.put('vtex-ng-filter-summary.html',
    "<div class=\"filters-summary\"><small ng-show=\"filters.length > 0\" ng-repeat=\"filter in filters.getAppliedFilters()\"><span ng-repeat=\"item in filter.getSelectedItems()\"><span class=\"label label-info\"><span translate=\"\">{{item.name}}</span>&nbsp; <a href=\"javascript:void(0);\" ng-click=\"filter.clearItem(item)\"><i class=\"icon-remove-sign\"></i></a></span>&nbsp;</span></small></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block\"><h3><span translate=\"\">listing.filters</span> <button translate=\"\" class=\"btn btn-small btn-clean-filters\" ng-click=\"clearAll()\">listing.clearAll</button></h3><accordion close-others=\"true\"><accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" heading=\"{{ 'filters.' + filter.rangeUrlTemplate | translate }} {{ filter.selectedCountLabel }}\" ng-repeat=\"filter in filters\"><div ng-switch=\"\" on=\"filter.type\"><div ng-switch-when=\"date\"><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates()\" translate=\"\">listing.dates.today</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-1, -1)\" translate=\"\">listing.dates.yesterday</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-7)\" translate=\"\">listing.dates.thisWeek</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(0, 0, true)\" translate=\"\">listing.dates.currentMonth</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-30)\" translate=\"\">listing.dates.thisMonth</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.clearSelection()\" translate=\"\">listing.dates.clearFilter</a></p><div class=\"input-append\"><input type=\"text\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\" value=\"{{filter.dateRangeLabel()}}\" readonly><a href=\"javascript:void(0);\" class=\"add-on\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\"><i class=\"icon-calendar\"></i></a></div><div class=\"date-selectors\" ng-show=\"openFilters[filter.rangeUrlTemplate + 'Selector']\"><div class=\"controls\"><p translate=\"\">listing.dates.from</p><div class=\"well well-small pull-left\" ng-model=\"filter.date.from\"><datepicker show-weeks=\"false\" max=\"filter.date.to ? filter.date.to : filter.today\"></datepicker></div></div><div class=\"controls\"><p translate=\"\">listing.dates.to</p><div class=\"well well-small pull-left\" ng-model=\"filter.date.to\"><datepicker show-weeks=\"false\" min=\"filter.date.from\" max=\"filter.today\"></datepicker></div></div></div></div><div ng-switch-default=\"\"><ul class=\"filter-list nav nav-pills nav-stacked\"><!-- If 5 items, show all 5.\n" +
    "                             If 6 items, show all 6.\n" +
    "                             If 7 items, show 5 and button to show more. --><li ng-repeat=\"item in filter.items\" ng-show=\"(filter.items.length <= 6) || ($index < 5) || moreOptionsShowFilters[filter.rangeUrlTemplate]\"><label class=\"checkbox\" ng-if=\"filter.type == 'multiple'\"><input type=\"checkbox\" name=\"{{filter.name}}\" ng-model=\"item.selected\" ng-change=\"filter.updateSelectedCount()\"><span translate=\"\">{{ item.name }} {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label><label class=\"radio\" ng-if=\"filter.type == 'single'\"><input type=\"radio\" name=\"{{filter.name}}\" ng-model=\"filter.selectedItem\" ng-value=\"item\"><span translate=\"\">{{ item.name }} {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label></li></ul><a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-show=\"filter.items.length > 6 && !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a> <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-show=\"filter.items.length > 6 && moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsHide' | translate}}</a> <button translate=\"\" class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.type === 'single' && filter.selectedItem\">search.clear</button></div></div></accordion-group></accordion></div>"
  );
 });