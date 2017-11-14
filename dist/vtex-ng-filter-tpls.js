/*! vtex-ng-filter - v0.4.6 - 2017-11-14 */
(function() {
  var config, loadInitialFilter, moreOptionsShowFilters, openFilters,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  loadInitialFilter = true;

  angular.module('vtexNgFilter', []).factory('Filter', function($rootScope, $location, $filter, DateTransform) {
    var Filter;
    return Filter = (function() {
      function Filter(filter) {
        var dateGetterSetter, k, querystring, ref, v;
        if (filter == null) {
          filter = {};
        }
        this.setGroup = bind(this.setGroup, this);
        this.update = bind(this.update, this);
        this.clearSelection = bind(this.clearSelection, this);
        this.getSelectedItemsURL = bind(this.getSelectedItemsURL, this);
        this.getSelectedItems = bind(this.getSelectedItems, this);
        this.setSelectedItems = bind(this.setSelectedItems, this);
        this.updateSelectedCount = bind(this.updateSelectedCount, this);
        this.setInitialFilter = bind(this.setInitialFilter, this);
        for (k in filter) {
          v = filter[k];
          this[k] = v;
        }
        querystring = $location.search();
        if (loadInitialFilter && querystring.orderBy === 'creationDate,desc' && Object.keys(querystring).length === 1) {
          this.setInitialFilter();
        }
        this.useTimezoneOffset = (ref = querystring['p_f_useUserTimezone']) === false || ref === 'false' ? false : true;
        this.currentTimezoneOffset = (function() {
          var offset, symbol;
          offset = new Date().getTimezoneOffset() / 60;
          symbol = parseInt(offset) >= 0 ? '+' : '';
          return {
            label: symbol + offset + 'h',
            value: offset
          };
        })();
        this.onUseTimezoneOffsetChange = (function(_this) {
          return function() {
            return $location.search('p_f_useUserTimezone', _this.useTimezoneOffset);
          };
        })(this);
        this.setGroup();
        this.selectedCount = 0;
        this.setDelivery = (function(_this) {
          return function(filter, item) {
            return $location.search(filter.rangeUrlTemplate, item.url);
          };
        })(this);
        if (this.type === 'date') {
          this.dateObjectCache = {};
          dateGetterSetter = (function(_this) {
            return function(date, propertyName) {
              var ref1;
              if (angular.isDefined(date)) {
                return _this[propertyName] = date;
              } else {
                return (ref1 = _this[propertyName]) != null ? ref1 : false;
              }
            };
          })(this);
          this.date = {};
          this.today = DateTransform.endOfDay(new Date(), this.useTimezoneOffset);
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
                from: DateTransform.startOfDay(date.from, _this.useTimezoneOffset),
                to: DateTransform.startOfDay(date.to, _this.useTimezoneOffset)
              };
            };
          })(this);
          this.dateRangeLabel = (function(_this) {
            return function() {
              var diffInDays;
              if (_this.date.from && _this.date.to) {
                if (DateTransform.startOfDay(_this.date.from, _this.useTimezoneOffset).toString() === DateTransform.startOfDay(new Date(), _this.useTimezoneOffset).toString()) {
                  return 'listing.dates.today';
                } else if (moment(_this.date.from) === DateTransform.startOfDay(moment().add('d', -1), _this.useTimezoneOffset) && moment(_this.date.to).toISOString() === DateTransform.endOfDay(moment().add('d', -1), _this.useTimezoneOffset).toISOString()) {
                  return 'listing.dates.yesterday';
                } else if (moment(_this.date.from).isSame(moment().startOf('month').toDate()) && moment(_this.date.to).isSame(moment().endOf('month').toDate())) {
                  return 'listing.dates.currentMonth';
                } else if (DateTransform.startOfDay(_this.date.to, _this.useTimezoneOffset).toISOString() === DateTransform.startOfDay(new Date(), _this.useTimezoneOffset).toISOString()) {
                  diffInDays = moment(_this.date.from).diff(moment(_this.date.to), 'days');
                  if (diffInDays === -7) {
                    return 'listing.dates.thisWeek';
                  } else if (diffInDays === -30) {
                    return 'listing.dates.thisMonth';
                  } else {
                    return (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter('translate')('listing.dates.untilToday'));
                  }
                } else {
                  return (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter('translate')('listing.dates.until')) + " " + (moment(_this.date.to).add('hours', moment().hours()).fromNow());
                }
              } else {
                return 'listing.dates.noRangeSelected';
              }
            };
          })(this);
        }
        this.updateSelectedCount();
      }

      Filter.prototype.setInitialFilter = function(useTimezoneOffset) {
        var range, today;
        loadInitialFilter = false;
        if (useTimezoneOffset == null) {
          useTimezoneOffset = true;
        }
        today = moment().add('d', 0).toDate();
        range = {
          from: DateTransform.startOfDay(today, useTimezoneOffset),
          to: DateTransform.endOfDay(today, useTimezoneOffset)
        };
        return $location.search('f_creationDate', "creationDate:[" + (range.from.toISOString()) + " TO " + (range.to.toISOString()) + "]");
      };

      Filter.prototype.updateSelectedCount = function() {
        var i, item, j, l, lastSelectedItemIndex, len, len1, ref, ref1, selectedItemIndex;
        if (this.type === 'date') {
          this.selectedCount = this.date.from && this.date.to ? 1 : 0;
        } else if (this.type === 'multiple') {
          ref = this.items;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            item = ref[i];
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
          ref1 = this.items;
          for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
            item = ref1[i];
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
        var date, item, items, j, len, ref, ref1;
        if (this.type === 'date') {
          items = itemsAsSearchParameter.replace(this.name + ':[', '').replace(']', '').split(' TO ');
          date = {
            from: items[0],
            to: items[1]
          };
          this.date = date;
        } else if (this.type === 'multiple') {
          ref = this.items;
          for (j = 0, len = ref.length; j < len; j++) {
            item = ref[j];
            item.selected = (ref1 = item.url, indexOf.call(itemsAsSearchParameter.split(','), ref1) >= 0);
          }
        } else if (this.type === 'single') {
          this.selectedItem = _.find(this.items, function(i) {
            return i.url === itemsAsSearchParameter;
          });
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.getSelectedItems = function() {
        var base, item, j, len, ref, results, url;
        if (this.type === 'date') {
          if (this.date.from && this.date.to) {
            url = this.name + ":[" + DateTransform.startOfDay(this.date.from, this.useTimezoneOffset).toISOString() + " TO " + DateTransform.endOfDay(this.date.to, this.useTimezoneOffset).toISOString() + "]";
            (base = this.dateObjectCache)[url] || (base[url] = {
              name: this.dateRangeLabel(),
              url: url
            });
            return [this.dateObjectCache[url]];
          } else {
            return [];
          }
        } else if (this.type === 'multiple') {
          ref = this.items;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            item = ref[j];
            if (item.selected) {
              results.push(item);
            }
          }
          return results;
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
        var item, j, len, ref, ref1;
        if ((ref = this.type) === 'date' || ref === 'single') {
          return this.clearSelection();
        } else if (this.type === 'multiple') {
          ref1 = this.items;
          for (j = 0, len = ref1.length; j < len; j++) {
            item = ref1[j];
            if (itemObject.url === item.url) {
              item.selected = false;
            }
          }
          return this.updateSelectedCount();
        }
      };

      Filter.prototype.clearSelection = function() {
        var item, j, len, ref;
        if (this.type === 'date') {
          this.date = {};
        } else if (this.type === 'multiple') {
          ref = this.items;
          for (j = 0, len = ref.length; j < len; j++) {
            item = ref[j];
            item.selected = false;
          }
        } else if (this.type === 'single') {
          this.selectedItem = null;
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.update = function(filterJSON) {
        var item, j, len, ref, ref1, updatedItem;
        if (filterJSON == null) {
          filterJSON = this;
        }
        ref = this.items;
        for (j = 0, len = ref.length; j < len; j++) {
          item = ref[j];
          updatedItem = _.find(filterJSON.items, function(i) {
            return i.name === item.name;
          });
          if (updatedItem && ((ref1 = this.getSelectedItems()) != null ? ref1.length : void 0) === 0) {
            item.quantity = updatedItem.quantity;
          } else {
            item.quantity = 0;
          }
        }
      };

      Filter.prototype.setGroup = function() {
        var ref, ref1, ref2;
        if ((ref = this.name) === 'creationDate' || ref === 'authorizedDate' || ref === 'ShippingEstimatedDate' || ref === 'invoicedDate') {
          return this.groupName = 'date';
        } else if ((ref1 = this.name) === 'SalesChannelName' || ref1 === 'CallCenterOperatorName' || ref1 === 'SellerNames' || ref1 === 'UtmSource' || ref1 === 'affiliateId' || ref1 === 'MarketingTags') {
          return this.groupName = 'channel';
        } else if ((ref2 = this.name) === 'StatusDescription' || ref2 === 'orderSituation' || ref2 === 'errorStatus') {
          return this.groupName = 'status';
        } else {
          return this.groupName = 'other';
        }
      };

      return Filter;

    })();
  }).service('DateTransform', function() {
    this.startOfDay = function(dateStr, useTimezoneOffset) {
      var date, dateInUTC, isAlreadyStartOfDay;
      if (useTimezoneOffset == null) {
        useTimezoneOffset = true;
      }
      date = new Date(dateStr);
      isAlreadyStartOfDay = dateStr && ((dateStr.indexOf && dateStr.indexOf('00:00:00.000Z') !== -1) || dateStr.toISOString && dateStr.toISOString().indexOf('00:00:00.000Z') !== -1);
      if (isAlreadyStartOfDay) {
        return date;
      }
      date.setHours(0, 0, 0, 0);
      if (useTimezoneOffset) {
        return date;
      } else {
        dateInUTC = new Date(date.valueOf() - (date.getTimezoneOffset() * 60000));
        return dateInUTC;
      }
    };
    this.endOfDay = function(dateStr, useTimezoneOffset) {
      var date, dateInUTC, isAlreadyEndOfDay;
      if (useTimezoneOffset == null) {
        useTimezoneOffset = true;
      }
      date = new Date(dateStr);
      isAlreadyEndOfDay = dateStr && ((dateStr.indexOf && dateStr.indexOf('23:59:59.999Z') !== -1) || dateStr.toISOString && dateStr.toISOString().indexOf('23:59:59.999Z') !== -1);
      if (isAlreadyEndOfDay) {
        return date;
      }
      date.setHours(23, 59, 59, 999);
      if (useTimezoneOffset) {
        return date;
      } else {
        dateInUTC = new Date(date.valueOf() - (date.getTimezoneOffset() * 60000));
        return dateInUTC;
      }
    };
    return this;
  }).directive('vtFilter', function($rootScope, $location, DateTransform, filterTimeLimit) {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter.html' : 'vtex-ng-filter.html',
      link: function($scope) {
        var filter, filters, j, len, updateFiltersOnLocationSearch;
        filters = _.flatten($scope.filters);
        for (j = 0, len = filters.length; j < len; j++) {
          filter = filters[j];
          if (!openFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            openFilters[filter.rangeUrlTemplate] = false;
          }
          if (!moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            moreOptionsShowFilters[filter.rangeUrlTemplate] = false;
          }
        }
        if (filterTimeLimit && filterTimeLimit.value) {
          $scope.filterTimeLimit = true;
        }
        $scope.openFilters = openFilters;
        $scope.moreOptionsShowFilters = moreOptionsShowFilters;
        $scope.clearAll = function() {
          var l, len1, results;
          results = [];
          for (l = 0, len1 = filters.length; l < len1; l++) {
            filter = filters[l];
            results.push(filter.clearSelection());
          }
          return results;
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
          var l, len1, results, searchQuery;
          results = [];
          for (l = 0, len1 = filters.length; l < len1; l++) {
            filter = filters[l];
            searchQuery = $location.search()[filter.rangeUrlTemplate];
            if (searchQuery) {
              filter.setSelectedItems(decodeURIComponent(searchQuery));
              results.push(filter.update());
            } else {
              results.push(filter.clearSelection());
            }
          }
          return results;
        };
        updateFiltersOnLocationSearch();
        $scope.$on('$locationChangeStart', function() {
          var k, ref, results, v;
          ref = $location.search();
          results = [];
          for (k in ref) {
            v = ref[k];
            results.push($location.search(k, decodeURIComponent(v)));
          }
          return results;
        });
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
            var l, len1;
            if (newValue === oldValue) {
              return;
            }
            if (filter.type === 'date' && (filter.date != null)) {
              filters[i].date.from = filter.date.from;
              filters[i].date.to = filter.date.to;
              if (!$rootScope.$$phase) {
                $rootScope.$digest();
              }
            }
            for (l = 0, len1 = filters.length; l < len1; l++) {
              filter = filters[l];
              $location.search(filter.rangeUrlTemplate, filter.getSelectedItemsURL());
            }
            return $location.search('page', 1);
          });
        });
      }
    };
  }).directive('vtFilterSummary', function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter-summary.html' : 'vtex-ng-filter-summary.html'
    };
  }).directive('vtFilterButton', function() {
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
    "<div class=\"filters-summary\"><small ng-if=\"filters.length\" ng-repeat=\"filter in filters.getAppliedFilters()\"><span ng-repeat=\"item in filter.getSelectedItems()\"><span class=\"label label-info\"><span ng-switch=\"filter.name\"><span ng-switch-when=\"status\" translate=\"\">{{ 'detail.state.' + item.name }}</span> <span ng-switch-when=\"ShippingEstimatedDate\" translate=\"\">{{ 'filters.group-date-deliver.' + item.name }}</span> <span ng-switch-default=\"\" translate=\"\">{{ item.name }}</span></span> &nbsp; <a href=\"javascript:void(0);\" ng-click=\"filter.clearItem(item)\"><i class=\"icon-remove-sign\"></i></a></span>&nbsp;</span></small></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block filters-container\"><h3><span translate=\"\">listing.filters</span> <button translate=\"\" class=\"btn btn-small btn-clean-filters\" ng-if=\"filters.getAppliedFilters().length\" ng-click=\"clearAll()\" ga-event=\"\" ga-label=\"filter-clear-all\">listing.clearAll</button></h3><div ng-repeat=\"group in filters track by group[0].groupName\"><h3 class=\"group-header\"><i ng-class=\"{ 'icon-calendar-empty': group[0].groupName === 'date',\n" +
    "                           'icon-exchange': group[0].groupName === 'channel',\n" +
    "                            'icon-refresh': group[0].groupName === 'status',\n" +
    "                             'icon-filter': group[0].groupName === 'other' }\"></i> {{ ('filters.groups.' + group[0].groupName) | translate }}</h3><accordion close-others=\"true\"><accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" ng-repeat=\"filter in group track by filter.name\"><accordion-heading><span>{{ 'filters.' + filter.rangeUrlTemplate | translate }}</span> <span ng-if=\"filter.getSelectedItems().length\" class=\"badge badge-lightblue pull-right\"><span ng-if=\"filter.type === 'multiple' && filter.selectedCount\">{{ filter.selectedCount }}</span> <span ng-if=\"filter.type !== 'multiple'\" class=\"fa fa-dot-circle-o\"></span></span></accordion-heading><!-- DATE --><div ng-if=\"filter.type === 'date'\"><div class=\"pull-right\"><label class=\"checkbox\"><span translate=\"\">filters.useMyTimezone</span><input type=\"checkbox\" ng-model=\"filter.useTimezoneOffset\" ng-change=\"filter.onUseTimezoneOffsetChange()\" name=\"filter{{$index}}-use-timezone-offset\">&nbsp; <small class=\"label label-info\">{{ ::filter.currentTimezoneOffset.label }}</small></label></div><!--<pre>{{filter}}</pre>--><p><a ng-class=\"{ 'filter-active' : filter.dateRangeLabel() === 'listing.dates.today' }\" href=\"javascript: void(0)\" ng-click=\"filter.setDates()\" translate=\"\">listing.dates.today</a></p><p><a ng-class=\"{ 'filter-active' : filter.dateRangeLabel() === 'listing.dates.yesterday' }\" href=\"javascript: void(0)\" ng-click=\"filter.setDates(-1, -1)\" translate=\"\">listing.dates.yesterday</a></p><p><a ng-class=\"{ 'filter-active' : filter.dateRangeLabel() === 'listing.dates.thisWeek' }\" href=\"javascript: void(0)\" ng-click=\"filter.setDates(-7)\" translate=\"\">listing.dates.thisWeek</a></p><p><a ng-class=\"{ 'filter-active' : filter.dateRangeLabel() === 'listing.dates.currentMonth' }\" href=\"javascript: void(0)\" ng-click=\"filter.setDates(0, 0, true)\" translate=\"\">listing.dates.currentMonth</a></p><p><a ng-class=\"{ 'filter-active' : filter.dateRangeLabel() === 'listing.dates.thisMonth' }\" href=\"javascript: void(0)\" ng-click=\"filter.setDates(-30)\" translate=\"\">listing.dates.thisMonth</a></p><div class=\"input-append\"><input type=\"text\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\" value=\"{{filter.dateRangeLabel() | translate}}\" readonly><a href=\"javascript:void(0);\" class=\"add-on\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\"><i class=\"icon-calendar\"></i></a></div><!-- DATEPICKERS --><div class=\"date-selectors\" ng-if=\"openFilters[filter.rangeUrlTemplate + 'Selector']\"><div class=\"row-fluid\"><!-- Message used in OMS --><div ng-if=\"filterTimeLimit\"><i class=\"icon-info-sign icon-blue\"></i>&nbsp; <i translate=\"\">search.date-range-limit</i></div><div class=\"span5 control-group vtex-datepicker-container\"><label for=\"date-from-{{ $index }}\" translate=\"\">listing.dates.from</label><input type=\"text\" id=\"date-from-{{ $index }}\" use-timezone-offset=\"filter.useTimezoneOffset\" date-model=\"filter.date.from\" period-of-day=\"start\" vtex-datepicker=\"\"></div><div class=\"span5 offset1 control-group vtex-datepicker-container\"><label for=\"date-to-{{ $index }}\" translate=\"\">listing.dates.to</label><input type=\"text\" id=\"date-to-{{ $index }}\" use-timezone-offset=\"filter.useTimezoneOffset\" date-model=\"filter.date.to\" period-of-day=\"end\" vtex-datepicker=\"\"></div></div><!-- /row-fluid --></div><!-- /datepickers --><p><button class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.selectedCount\" translate=\"\">search.clear</button></p></div><!-- /DATE --><div ng-if=\"filter.type !== 'date'\"><ul class=\"filter-list nav nav-pills nav-stacked\"><!-- If 5 items, show all 5.\n" +
    "\t\t\t\t\t\t\t\t If 6 items, show all 6.\n" +
    "\t\t\t\t\t\t\t\t If 7 items, show 5 and button to show more. --><li ng-repeat=\"item in filter.items track by item.name\" ng-if=\"(filter.items.length <= 6) || ($index < 5) || moreOptionsShowFilters[filter.rangeUrlTemplate]\"><label class=\"checkbox\" ng-if=\"filter.type == 'multiple'\"><input type=\"checkbox\" name=\"{{filter.name}}\" ng-model=\"item.selected\" ng-change=\"filter.updateSelectedCount()\"><span ng-if=\"filter.name == 'status'\"><span translate=\"\">{{ 'detail.state.' + item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span> <span ng-if=\"filter.name != 'status'\"><span translate=\"\">{{ item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label><label class=\"radio\" ng-if=\"filter.type == 'single' && filter.name != 'ShippingEstimatedDate'\"><input type=\"radio\" name=\"{{filter.name}}\" ng-model=\"filter.selectedItem\" ng-value=\"item\"><span><span translate=\"\">{{ item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label><p ng-if=\"filter.name == 'ShippingEstimatedDate'\"><a href=\"javascript:void(0)\" ng-click=\"filter.setDelivery(filter, item)\" ng-model=\"filter.selectedItem\" ng-class=\"{ 'filter-active' : filter.selectedItem.name === item.name }\"><span><span ng-show=\"filter.name === 'ShippingEstimatedDate'\" translate=\"\">{{ 'filters.group-date-deliver.' + item.name }}</span> <span ng-hide=\"filter.name === 'ShippingEstimatedDate'\" translate=\"\">{{ item.name }}</span> {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></a></p></li></ul><a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-if=\"filter.items.length > 6 && !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a> <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-if=\"filter.items.length > 6 && moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsHide' | translate}}</a><p><button translate=\"\" class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.selectedItem || filter.selectedCount\">search.clear</button></p></div></accordion-group></accordion></div></div>"
  );
 });