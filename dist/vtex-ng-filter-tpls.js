/*! vtex-ng-filter - v0.3.1 - 2015-05-07 */
(function() {
  var config, moreOptionsShowFilters, openFilters,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('vtexNgFilter', []).factory("Filter", function(DateTransform, $filter) {
    var Filter;
    return Filter = (function() {
      function Filter(filter) {
        this.setGroup = __bind(this.setGroup, this);
        this.update = __bind(this.update, this);
        this.clearSelection = __bind(this.clearSelection, this);
        this.getSelectedItemsURL = __bind(this.getSelectedItemsURL, this);
        this.getSelectedItems = __bind(this.getSelectedItems, this);
        this.setSelectedItems = __bind(this.setSelectedItems, this);
        this.updateSelectedCount = __bind(this.updateSelectedCount, this);
        var dateGetterSetter, k, v;
        for (k in filter) {
          v = filter[k];
          this[k] = v;
        }
        this.setGroup();
        this.selectedCount = 0;
        if (this.type === 'date') {
          this.dateObjectCache = {};
          dateGetterSetter = (function(_this) {
            return function(date, propertyName) {
              var _ref;
              if (angular.isDefined(date)) {
                return _this[propertyName] = date;
              } else {
                return (_ref = _this[propertyName]) != null ? _ref : false;
              }
            };
          })(this);
          this.date = {};
          this.today = DateTransform.endOfDay(new Date());
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
                from: DateTransform.startOfDay(date.from),
                to: DateTransform.startOfDay(date.to)
              };
            };
          })(this);
          this.dateRangeLabel = (function(_this) {
            return function() {
              if (_this.date.from && _this.date.to) {
                if (DateTransform.startOfDay(_this.date.from).toString() === DateTransform.startOfDay(new Date()).toString()) {
                  return $filter('translate')('listing.dates.today');
                } else if (moment(_this.date.from) === DateTransform.startOfDay(moment().add('d', -1)) && moment(_this.date.to).toISOString() === DateTransform.endOfDay(moment().add('d', -1)).toISOString()) {
                  return $filter('translate')('listing.dates.yesterday');
                } else if (moment(_this.date.from).isSame(moment().startOf('month').toDate()) && moment(_this.date.to).isSame(moment().endOf('month').toDate())) {
                  return $filter('translate')('listing.dates.currentMonth');
                } else if (DateTransform.startOfDay(_this.date.to).toISOString() === DateTransform.startOfDay(new Date()).toISOString()) {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter('translate')('listing.dates.untilToday'));
                } else {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter('translate')('listing.dates.until')) + " " + (moment(_this.date.to).add('hours', moment().hours()).fromNow());
                }
              } else {
                return $filter('translate')('listing.dates.noRangeSelected');
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
            url = this.name + ":[" + DateTransform.startOfDay(this.date.from).toISOString() + " TO " + DateTransform.endOfDay(this.date.to).toISOString() + "]";
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

      Filter.prototype.setGroup = function() {
        var _ref, _ref1, _ref2;
        if ((_ref = this.name) === 'creationDate' || _ref === 'authorizedDate' || _ref === 'ShippingEstimatedDate' || _ref === 'invoicedDate') {
          return this.groupName = 'date';
        } else if ((_ref1 = this.name) === 'SalesChannelName' || _ref1 === 'CallCenterOperatorName' || _ref1 === 'SellerNames' || _ref1 === 'UtmSource' || _ref1 === 'affiliateId') {
          return this.groupName = 'channel';
        } else if ((_ref2 = this.name) === 'StatusDescription' || _ref2 === 'orderSituation' || _ref2 === 'errorStatus') {
          return this.groupName = 'status';
        } else {
          return this.groupName = 'other';
        }
      };

      return Filter;

    })();
  }).service('DateTransform', function() {
    this.startOfDay = function(dateStr) {
      var date;
      date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date;
    };
    this.endOfDay = function(dateStr) {
      var date;
      date = new Date(dateStr);
      date.setHours(23, 59, 59, 999);
      return date;
    };
    this.validate = function(date) {
      if (date == null) {
        return;
      }
      date = new Date(date);
      if (date.getUTCDate() !== date.getDate()) {
        date.setDate(date.getUTCDate());
      }
      return date;
    };
    return this;
  }).directive("vtFilter", function($rootScope, $location, DateTransform) {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter.html' : 'vtex-ng-filter.html',
      link: function($scope) {
        var filter, filters, updateFiltersOnLocationSearch, _i, _len;
        filters = _.flatten($scope.filters);
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
        $scope.filters.getAppliedFilters = function() {
          return _.filter(filters, function(f) {
            return f.getSelectedItems().length > 0;
          });
        };
        $scope.filters.getAppliedItems = function() {
          return _.chain($scope.filters.getAppliedFilters()).map(function(f) {
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
              _results.push(filter.clearSelection());
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
          if (decodeURIComponent(queryFilters) === selectedFilters) {
            return;
          }
          return updateFiltersOnLocationSearch();
        });
        return _.each(filters, function(filter, i) {
          return $scope.$watch((function(scope) {
            return _.flatten(scope.filters)[i].getSelectedItemsURL();
          }), function(newValue, oldValue) {
            var _j, _len1;
            if (newValue === oldValue) {
              return;
            }
            if (filter.type === 'date' && (filter.date != null)) {
              filters[i].date.from = DateTransform.validate(filter.date.from);
              filters[i].date.to = DateTransform.validate(filter.date.to);
              if (!$rootScope.$$phase) {
                $rootScope.$digest();
              }
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
      templateUrl: config.path ? config.path + '/vtex-ng-filter-button.html' : 'vtex-ng-filter-button.html'
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
    "<a class=\"btn\" href=\"javascript:void(0);\" ng-click=\"openFilters()\" ga-event=\"\" ga-label=\"filter-open\"><i class=\"icon-filter\" ng-class=\"{ 'icon-blue': filters.getAppliedItems().length > 0 }\"></i>&nbsp; <span translate=\"\">listing.filters</span> <span class=\"badge badge-info badge-corner\" data-ng-show=\"filters.getAppliedItems().length > 0\">{{ filters.getAppliedItems().length }}</span></a>"
  );


  $templateCache.put('vtex-ng-filter-summary.html',
    "<div class=\"filters-summary\"><small ng-show=\"filters.length\" ng-repeat=\"filter in filters.getAppliedFilters()\"><span ng-repeat=\"item in filter.getSelectedItems()\"><span class=\"label label-info\"><span translate=\"\">{{ item.name }}</span>&nbsp; <a href=\"javascript:void(0);\" ng-click=\"filter.clearItem(item)\"><i class=\"icon-remove-sign\"></i></a></span>&nbsp;</span></small></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block\"><h3><span translate=\"\">listing.filters</span> <button translate=\"\" class=\"btn btn-small btn-clean-filters\" ng-if=\"filters.getAppliedFilters().length\" ng-click=\"clearAll()\" ga-event=\"\" ga-label=\"filter-clear-all\">listing.clearAll</button></h3><div ng-repeat=\"group in filters\"><h3 class=\"group-header\"><i ng-class=\"{ 'icon-calendar-empty':  group[0].groupName === 'date',\n" +
    "                        'icon-exchange': group[0].groupName === 'channel',\n" +
    "                         'icon-refresh': group[0].groupName === 'status',\n" +
    "                          'icon-filter': group[0].groupName === 'other' }\"></i> {{ ('filters.groups.' + group[0].groupName) | translate }}</h3><accordion close-others=\"true\"><accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" ng-repeat=\"filter in group\"><accordion-heading><span>{{ 'filters.' + filter.rangeUrlTemplate | translate }}</span> <span ng-if=\"filter.getSelectedItems().length\" class=\"badge badge-lightblue pull-right\"><span ng-if=\"filter.type === 'multiple' && filter.selectedCount\">{{ filter.selectedCount }}</span> <span ng-if=\"filter.type !== 'multiple'\" class=\"fa fa-dot-circle-o\"></span></span></accordion-heading><!-- DATE --><div ng-if=\"filter.type === 'date'\"><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates()\" translate=\"\">listing.dates.today</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-1, -1)\" translate=\"\">listing.dates.yesterday</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-7)\" translate=\"\">listing.dates.thisWeek</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(0, 0, true)\" translate=\"\">listing.dates.currentMonth</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-30)\" translate=\"\">listing.dates.thisMonth</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.clearSelection()\" translate=\"\">listing.dates.clearFilter</a></p><div class=\"input-append\"><input type=\"text\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\" value=\"{{filter.dateRangeLabel()}}\" readonly><a href=\"javascript:void(0);\" class=\"add-on\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\"><i class=\"icon-calendar\"></i></a></div><!-- DATEPICKERS --><div class=\"date-selectors\" ng-show=\"openFilters[filter.rangeUrlTemplate + 'Selector']\"><div class=\"row-fluid\"><div class=\"span5 control-group vtex-datepicker-container\"><label for=\"date-from-{{ $index }}\" translate=\"\">listing.dates.from</label><input type=\"text\" id=\"date-from-{{ $index }}\" vtex-datepicker=\"\" date-model=\"filter.date.from\"></div><div class=\"span5 offset1 control-group vtex-datepicker-container\"><label for=\"date-to-{{ $index }}\" translate=\"\">listing.dates.to</label><input type=\"text\" id=\"date-to-{{ $index }}\" vtex-datepicker=\"\" date-model=\"filter.date.to\"></div></div><!-- /row-fluid --></div><!-- /datepickers --></div><!-- /DATE --><div ng-if=\"filter.type !== 'date'\"><ul class=\"filter-list nav nav-pills nav-stacked\"><!-- If 5 items, show all 5.\n" +
    "\t\t\t\t\t\t\t\t If 6 items, show all 6.\n" +
    "\t\t\t\t\t\t\t\t If 7 items, show 5 and button to show more. --><li ng-repeat=\"item in filter.items\" ng-show=\"(filter.items.length <= 6) || ($index < 5) || moreOptionsShowFilters[filter.rangeUrlTemplate]\"><label class=\"checkbox\" ng-if=\"filter.type == 'multiple'\"><input type=\"checkbox\" name=\"{{filter.name}}\" ng-model=\"item.selected\" ng-change=\"filter.updateSelectedCount()\"><span><span translate=\"\">{{ item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label><label class=\"radio\" ng-if=\"filter.type == 'single'\"><input type=\"radio\" name=\"{{filter.name}}\" ng-model=\"filter.selectedItem\" ng-value=\"item\"><span><span translate=\"\">{{ item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label></li></ul><a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-show=\"filter.items.length > 6 && !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a> <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-show=\"filter.items.length > 6 && moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsHide' | translate}}</a> <button translate=\"\" class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.type === 'single' && filter.selectedItem\">search.clear</button></div></accordion-group></accordion></div></div>"
  );
 });