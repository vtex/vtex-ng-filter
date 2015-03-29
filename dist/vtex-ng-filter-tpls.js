/*! vtex-ng-filter - v0.3.1 - 2015-03-29 */
(function() {
  var config, moreOptionsShowFilters, openFilters;

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('vtexNgFilter', []).service("vtFilterService", function($http, TransactionGroup) {
    var getDateRangeFilter, setFacetsQuery, transformSearch;
    getDateRangeFilter = function(date) {
      var arr, range, _d, _i, _len, _ref;
      _d = "" + date.url + "->";
      arr = [];
      _ref = date.range;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        range = _ref[_i];
        arr.push("" + range.name + "[" + range.interval[0] + " TO " + range.interval[1] + "]");
      }
      _d += arr.join(';');
      return _d;
    };
    setFacetsQuery = function(filters) {
      var queries, querystring;
      querystring = "_facets=";
      queries = [];
      _.each(filters, function(f) {
        switch (f.type) {
          case "multiple":
            return queries.push(f.url);
          case "date":
            return queries.push(getDateRangeFilter(f));
        }
      });
      return querystring += queries.join(',');
    };
    transformSearch = function(searchObj) {
      var basicFilters, k, search, v;
      basicFilters = new TransactionGroup();
      search = [];
      for (k in searchObj) {
        v = searchObj[k];
        if (basicFilters[k]) {
          search.push("" + k + "=" + v);
        }
      }
      return search.join('&');
    };
    this.getFacets = function(endpoint, filters, search) {
      var url;
      url = "" + endpoint + "?" + (setFacetsQuery(filters));
      if (search) {
        url += "&" + (transformSearch(search));
      }
      return $http.get(url).then(function(res) {
        return res.data;
      });
    };
    return this;
  }).directive("vtFilter", function($rootScope, $location, TransactionGroup, vtFilterService) {
    return {
      restrict: 'E',
      scope: {
        endpoint: '=endpoint'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter.html' : 'vtex-ng-filter.html',
      link: function($scope) {
        var filters, getActiveFilters, setFilters;
        filters = new TransactionGroup();
        getActiveFilters = function(search) {
          var k, obj, v;
          obj = {};
          for (k in search) {
            v = search[k];
            if (filters[k]) {
              obj[k] = v.split(' OR ');
            }
          }
          return obj;
        };
        setFilters = function() {
          var locationSearch;
          locationSearch = $location.search();
          vtFilterService.getFacets($scope.endpoint, filters, locationSearch).then(function(res) {
            var locationActiveFilters;
            locationActiveFilters = getActiveFilters(locationSearch);
            return _.each(res, function(categoryOptions, categoryName) {
              var activeFilterName, filterName, filterQuantity, status, _i, _len, _ref, _results;
              _results = [];
              for (filterName in categoryOptions) {
                filterQuantity = categoryOptions[filterName];
                if (locationActiveFilters[categoryName]) {
                  _ref = locationActiveFilters[categoryName];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    activeFilterName = _ref[_i];
                    status = false;
                    if (activeFilterName === filterName) {
                      status = true;
                      break;
                    }
                  }
                }
                _results.push(filters[categoryName].setOptions(filterName, filterQuantity, status));
              }
              return _results;
            });
          });
          return $scope.groups = _.groupBy(filters, function(_f) {
            return _f.group;
          });
        };
        $scope.updateQueryString = function() {
          var filter, option, querieName, querieValue, query, querystring, url, _i, _len, _ref;
          console.log('FILTERS TO UPDATE QUERYSTRING', filters);
          querystring = [];
          query = {};
          for (url in filters) {
            filter = filters[url];
            _ref = filter.options;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              option = _ref[_i];
              if (option.active) {
                query[url] = query[url] || [];
                query[url].push(option.value);
              }
            }
            if (query[url]) {
              query[url] = query[url].join(' OR ');
            }
          }
          console.log('Query Object', query);
          for (querieName in query) {
            querieValue = query[querieName];
            querystring.push("" + querieName + "=" + querieValue);
          }
          querystring = querystring.join('&');
          console.log('QueryString', querystring);
          return $location.search(querystring);
        };
        setFilters();
        return $scope.$on('$locationChangeSuccess', function() {
          return setFilters();
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

(function() {
  angular.module('vtexNgFilter').factory('DefaultIntervalFilter', function() {
    var DefaultIntervalFilter;
    return DefaultIntervalFilter = (function() {
      function DefaultIntervalFilter() {
        return [
          {
            name: 'today',
            interval: ['now-1d', 'now']
          }, {
            name: 'yesterday',
            interval: ['now-2d', 'now-1d']
          }, {
            name: 'oneWeekAgo',
            interval: ['now-14d', 'now-7d']
          }
        ];
      }

      return DefaultIntervalFilter;

    })();
  }).factory('TransactionGroup', function(TransactionFilter) {
    var TransactionGroup;
    return TransactionGroup = (function() {
      function TransactionGroup() {
        var arr;
        arr = {};
        arr["startDate"] = new TransactionFilter("startDate", "startDate", "date", "date");
        arr["authorizationDate"] = new TransactionFilter("authorizationDate", "authorizationDate", "date", "date");
        arr["commitmentDate"] = new TransactionFilter("commitmentDate", "commitmentDate", "date", "date");
        arr["cancelationDate"] = new TransactionFilter("cancelationDate", "cancelationDate", "date", "date");
        arr["payments.paymentSystemName"] = new TransactionFilter("paymentSystem", "payments.paymentSystemName", "multiple", "paymentCondition");
        arr["payments.installments"] = new TransactionFilter("installments", "payments.installments", "multiple", "paymentCondition");
        arr["payments.connectorName"] = new TransactionFilter("connectorName", "payments.connectorName", "multiple", "channel");
        arr["payments.antifraudImplementation"] = new TransactionFilter("antifraudImplementation", "payments.antifraudImplementation", "multiple", "channel");
        arr["salesChannel"] = new TransactionFilter("salesChannel", "salesChannel", "multiple", "channel");
        arr["status"] = new TransactionFilter("status", "status", "multiple", "status");
        arr["payments.refunds"] = new TransactionFilter("refunds", "payments.refunds", "multiple", "status");
        return arr;
      }

      return TransactionGroup;

    })();
  }).factory('TransactionFilter', function(DefaultIntervalFilter) {
    var FilterOption, TransactionFilter;
    FilterOption = (function() {
      function FilterOption(name, quantity, type, status) {
        var intervals, option, range, _i, _len;
        option = {
          name: name,
          quantity: quantity,
          active: status
        };
        if (type !== 'date') {
          option.value = name;
        } else {
          intervals = new DefaultIntervalFilter();
          for (_i = 0, _len = intervals.length; _i < _len; _i++) {
            range = intervals[_i];
            if (range.name === name) {
              option.value = "" + range.interval[0] + " TO " + range.interval[1];
            }
          }
        }
        return option;
      }

      return FilterOption;

    })();
    return TransactionFilter = (function() {
      function TransactionFilter(name, url, type, group, range) {
        this.name = name;
        this.url = url;
        this.type = type;
        this.group = group;
        this.options = [];
        if (type === "date" && !range) {
          this.range = new DefaultIntervalFilter();
        } else {
          this.range = range;
        }
        this.setOptions = function(name, quantity, status) {
          return this.options.push(new FilterOption(name, quantity, this.type, status));
        };
      }

      return TransactionFilter;

    })();
  });

}).call(this);

angular.module("vtexNgFilter").run(function($templateCache) {   'use strict';

  $templateCache.put('vtex-ng-filter-button.html',
    "<a class=\"btn\" href=\"javascript:void(0);\" ng-click=\"openFilters()\" ga-event=\"\" ga-label=\"filter-open\"><i class=\"fa fa-filter\" ng-class=\"{ 'fa-blue': filters.getAppliedItems().length > 0 }\"></i>&nbsp; <span translate=\"\">listing.filters</span> <span class=\"badge badge-info badge-corner\" data-ng-show=\"filters.getAppliedItems().length > 0\">{{ filters.getAppliedItems().length }}</span></a>"
  );


  $templateCache.put('vtex-ng-filter-summary.html',
    "<div class=\"filters-summary\"><small ng-show=\"filters.length\" ng-repeat=\"filter in filters.getAppliedFilters()\"><span ng-repeat=\"item in filter.getSelectedItems()\"><span class=\"label label-info\"><span translate=\"\">{{ item.name }}</span>&nbsp; <a href=\"javascript:void(0);\" ng-click=\"filter.clearItem(item)\"><i class=\"icon-remove-sign\"></i></a></span>&nbsp;</span></small></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block\"><h3><span translate=\"\">listing.filters</span> <button translate=\"\" class=\"btn btn-small btn-clean-filters\" ng-click=\"clearAll()\">listing.clearAll</button></h3><div ng-repeat=\"(name, group) in groups\"><h3 class=\"group-header\"><i class=\"fa\" ng-class=\"{ 'fa-credit-card': name === 'paymentCondition',\n" +
    "                                 'fa-calendar-o': name === 'date', \n" +
    "                                   'fa-exchange': name === 'channel',\n" +
    "                                    'fa-refresh': name === 'status', }\"></i> {{ ('filters.groups.' + name) | translate }}</h3><accordion close-others=\"true\"><accordion-group ng-repeat=\"filter in group\"><accordion-heading>{{ 'filters.' + filter.name | translate }}</accordion-heading><ul class=\"filter-list nav nav-pills nav-stacked\"><li ng-repeat=\"item in filter.options\"><div class=\"checkbox\"><label><input type=\"checkbox\" ng-value=\"item.value\" ng-model=\"item.active\" ng-change=\"updateQueryString()\"><!-- <input type=\"radio\" name=\"{{filter.name}}\" ng-model=\"filter.selectedItem\" ng-value=\"item\"> -->{{ item.name | translate }} <span class=\"text-muted\">({{ item.quantity }})</span></label></div></li></ul><button translate=\"\" class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.type === 'single' && filter.selectedItem\">search.clear</button></accordion-group></accordion></div></div>"
  );
 });