angular.module("vtexNgFilter", []);(function() {
  angular.module('vtexNgFilter').filter('toBoolean', function() {
    return function(input) {
      return !!input;
    };
  });

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('vtexNgFilter').factory('DefaultIntervalFilter', function() {
    var DefaultIntervalFilter;
    return DefaultIntervalFilter = (function() {
      function DefaultIntervalFilter() {
        return [
          {
            name: 'today',
            interval: '[now-1d TO now]'
          }, {
            name: 'yesterday',
            interval: '[now-2d TO now-1d]'
          }, {
            name: 'thisWeek',
            interval: '[now-1w TO now]'
          }, {
            name: 'oneWeekAgo',
            interval: '[now-2w TO now-1w]'
          }, {
            name: 'twoWeeksAgo',
            interval: '[now-3w TO now-2w]'
          }, {
            name: 'thisMonth',
            interval: '[now-30d TO now]'
          }, {
            name: 'lastMonth',
            interval: '[now-60d TO now-30d]'
          }
        ];
      }

      return DefaultIntervalFilter;

    })();
  }).factory('TransactionGroup', function(TransactionFilter) {
    var TransactionGroup;
    return TransactionGroup = (function() {
      function TransactionGroup() {
        this.startDate = new TransactionFilter('startDate', 'startDate', 'date', 'date');
        this.authorizationDate = new TransactionFilter('authorizationDate', 'authorizationDate', 'date', 'date');
        this.commitmentDate = new TransactionFilter('commitmentDate', 'commitmentDate', 'date', 'date');
        this.cancelationDate = new TransactionFilter('cancelationDate', 'cancelationDate', 'date', 'date');
        this.salesChannel = new TransactionFilter('salesChannel', 'salesChannel', 'multiple', 'channel');
        this.status = new TransactionFilter('status', 'status', 'multiple', 'status');
        this.payments = {
          paymentSystemName: new TransactionFilter('paymentSystem', 'payments.paymentSystemName', 'multiple', 'paymentCondition'),
          installments: new TransactionFilter('installments', 'payments.installments', 'multiple', 'paymentCondition'),
          connectorName: new TransactionFilter('connectorName', 'payments.connectorName', 'multiple', 'channel'),
          antifraudImplementation: new TransactionFilter('antifraudImplementation', 'payments.antifraudImplementation', 'multiple', 'channel'),
          refunds: new TransactionFilter('refunds', 'payments.refunds', 'multiple', 'status')
        };
      }

      return TransactionGroup;

    })();
  }).factory('TransactionFilter', function(DefaultIntervalFilter) {
    var FilterOption, TransactionFilter;
    FilterOption = (function() {
      function FilterOption(name, quantity, type, status, group, filterName) {
        var i, len, range, ref;
        this.option = {
          name: name,
          quantity: quantity,
          active: status,
          group: group,
          filterName: filterName
        };
        if (type !== 'date') {
          this.option.value = (function(name) {
            if (typeof name === 'string' && name.indexOf(' ') >= 0) {
              return "'" + name + "'";
            } else {
              return name;
            }
          })(name);
        } else {
          ref = new DefaultIntervalFilter();
          for (i = 0, len = ref.length; i < len; i++) {
            range = ref[i];
            if (range.name === name) {
              this.option.value = range.interval;
            }
          }
        }
        return this.option;
      }

      return FilterOption;

    })();
    return TransactionFilter = (function() {
      function TransactionFilter(name, url, type, group, range) {
        this.setOptions = bind(this.setOptions, this);
        this.clearOptions = bind(this.clearOptions, this);
        this.name = name;
        this.url = url;
        this.type = type;
        this.group = group;
        this.active = false;
        if (type === 'date' && !this.range) {
          this.range = new DefaultIntervalFilter();
        }
        this.options = [];
      }

      TransactionFilter.prototype.clearOptions = function() {
        var i, len, option, ref, results;
        ref = this.options;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          option = ref[i];
          option.active = false;
          results.push(option.quantity = 0);
        }
        return results;
      };

      TransactionFilter.prototype.setOptions = function(name, quantity, status, group) {
        var i, isActive, len, newOption, option, ref, updatedOption;
        if (group == null) {
          group = this.group;
        }
        updatedOption = false;
        isActive = false;
        status = status ? true : false;
        ref = this.options;
        for (i = 0, len = ref.length; i < len; i++) {
          option = ref[i];
          if (!(name === option.name)) {
            continue;
          }
          isActive || (isActive = option.active);
          option.quantity = quantity;
          option.active = status;
          updatedOption = option;
        }
        this.active = status || isActive;
        if (updatedOption) {
          return updatedOption;
        }
        newOption = new FilterOption(name, quantity, this.type, status, group, this.name);
        this.options.push(newOption);
        return newOption;
      };

      return TransactionFilter;

    })();
  });

}).call(this);

(function() {
  angular.module('vtexNgFilter').service('vtFilterService', function($http, $location, $rootScope, TransactionGroup, DefaultIntervalFilter) {
    var baseInterval, getDateRangeFilter, setFacetsQuery, transformSearch;
    baseInterval = new DefaultIntervalFilter();
    this.filters = new TransactionGroup();
    this.activeFilters = {
      list: []
    };
    getDateRangeFilter = function(date) {
      var _d, arr, j, len, range, ref;
      _d = date.url + "->";
      arr = [];
      ref = date.range;
      for (j = 0, len = ref.length; j < len; j++) {
        range = ref[j];
        arr.push("" + range.name + range.interval);
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
          case 'multiple':
            return queries.push(f.url);
          case 'date':
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
          search.push(k + "=" + v);
        }
      }
      return search.join('&');
    };
    this.updateQueryString = (function(_this) {
      return function() {
        var facet, filter, j, len, option, query, ref, ref1, ref2;
        query = {};
        ref = _this.filters;
        for (facet in ref) {
          filter = ref[facet];
          query[facet] = query[facet] || [];
          if (filter != null ? (ref1 = filter.options) != null ? ref1.length : void 0 : void 0) {
            ref2 = filter.options;
            for (j = 0, len = ref2.length; j < len; j++) {
              option = ref2[j];
              if (option.active) {
                query[facet].push(option.value);
              }
            }
          }
          if (query[facet].length) {
            query[facet] = query[facet].join(' OR ');
          } else {
            query[facet] = null;
          }
        }
        $rootScope.$emit('filterChanged', query);
        return $location.search(query);
      };
    })(this);
    this.clearAllFilters = (function(_this) {
      return function() {
        var filter, name, option, ref, ref1, results;
        ref = _this.filters;
        results = [];
        for (name in ref) {
          filter = ref[name];
          _this.filters[name].active = false;
          if ((ref1 = filter.options) != null ? ref1.length : void 0) {
            results.push((function() {
              var j, len, ref2, results1;
              ref2 = filter.options;
              results1 = [];
              for (j = 0, len = ref2.length; j < len; j++) {
                option = ref2[j];
                results1.push(option.active = false);
              }
              return results1;
            })());
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this);
    this.setFilters = (function(_this) {
      return function(endpoint, filters, search) {
        var locationActiveFilters;
        locationActiveFilters = _this.getQueryStringFilters(search, filters);
        _this.activeFilters.list = [];
        return _this.getAvailableFacets(endpoint, filters, search).then(function(res) {
          return _.each(res, function(categoryOptions, categoryName) {
            var activeFilterName, existing, filterName, filterQuantity, j, len, option, ref, results, status;
            filters[categoryName].clearOptions();
            results = [];
            for (filterName in categoryOptions) {
              filterQuantity = categoryOptions[filterName];
              if (locationActiveFilters[categoryName]) {
                ref = locationActiveFilters[categoryName];
                for (j = 0, len = ref.length; j < len; j++) {
                  activeFilterName = ref[j];
                  status = activeFilterName.indexOf(filterName) >= 0 ? activeFilterName : void 0;
                  if (status) {
                    break;
                  }
                }
              }
              if (status === 'true') {
                status = true;
              }
              if (status === 'false') {
                status = false;
              }
              option = filters[categoryName].setOptions(filterName, filterQuantity, status);
              if (option.active) {
                existing = _.find(_this.activeFilters.list, function(o) {
                  return o.filterName === option.filterName;
                });
                if (!existing) {
                  _this.activeFilters.list.push(option);
                }
                if (existing) {
                  results.push(_this.activeFilters.list[categoryName] = option);
                } else {
                  results.push(void 0);
                }
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
        });
      };
    })(this);
    this.getQueryStringFilters = function(search, filters) {
      var interval, k, obj, v;
      obj = {};
      for (k in search) {
        v = search[k];
        if (!filters[k]) {
          continue;
        }
        if (filters[k].type === 'date') {
          interval = _.find(baseInterval, function(i) {
            return i.interval === v;
          });
          v = interval.name;
        }
        obj[k] = v.split(' OR ');
      }
      return obj;
    };
    this.getAvailableFacets = function(endpoint, filters, search) {
      var url;
      url = endpoint + "?" + (setFacetsQuery(filters));
      if (transformSearch(search)) {
        url += "&" + (transformSearch(search));
      }
      return $http.get(url, {
        cache: true
      }).then(function(res) {
        return res.data;
      });
    };
    return this;
  });

}).call(this);

angular.module("vtexNgFilter").run(function($templateCache) {   'use strict';

  $templateCache.put('vtex-ng-filter-button.html',
    "<div class=\"uim-btn-filter\" ng-class=\"{ 'uim-filter-checked': activeFilters.list.length }\"><button class=\"btn\" ng-click=\"openFilterSidebar()\"><i class=\"fa fa-filter\"></i> <span class=\"uim-filter-count badge\" ng-show=\"activeFilters.list.length\">{{ activeFilters.list.length }}</span></button></div>"
  );


  $templateCache.put('vtex-ng-filter-summary.html',
    "<div class=\"filters-summary\"><span ng-if=\"activeFilters.list.length\" ng-repeat=\"filter in activeFilters.list\" ng-if=\"filter.active\"><button class=\"btn btn-xs btn-info\" ng-click=\"disableFilter(filter)\" ng-switch=\"\" on=\"filter.group\"><span ng-switch-when=\"date\">{{ ::('filters.' + filter.filterName) | translate }} : {{::((\"listing.dates.\" + filter.name) | translate)}}</span> <span ng-switch-when=\"status\">{{ ::('filters.' + filter.filterName) | translate }} : {{::(\"transactions.status.\" + (filter.name | capitalize) | translate)}}</span> <span ng-switch-default=\"\">{{ ::('filters.' + filter.filterName) | translate }} : {{::filter.name}}</span> &nbsp; <i class=\"fa fa-remove\"></i></button>&nbsp;</span></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block\"><h3>{{ 'listing.filters' | translate }} <button class=\"btn btn-small btn-clean-filters\" ng-if=\"activeFilters.list.length\" ng-click=\"clearAllFilters()\" ga-event=\"\" ga-category=\"transaction list\" ga-action=\"clear filters\" ga-label=\"transaction filters\" translate=\"\">listing.clearAll</button></h3><div ng-repeat=\"(name, group) in groups\"><h3 class=\"group-header\"><i class=\"fa\" ng-class=\"{ 'fa-credit-card': name === 'paymentCondition',\n" +
    "                                'fa-calendar-o': name === 'date',\n" +
    "                                'fa-exchange': name === 'channel',\n" +
    "                                'fa-refresh': name === 'status', }\"></i> {{ ('filters.groups.' + name) | translate }}</h3><accordion close-others=\"true\"><accordion-group ng-repeat=\"filter in group\" ng-if=\"filter.options.length\"><accordion-heading>{{ 'filters.' + filter.name | translate }} <span class=\"label label-info pull-right\" ng-if=\"filter.active\"><i class=\"fa fa-dot-circle-o\"></i></span></accordion-heading><ul class=\"filter-list nav nav-pills nav-stacked\"><li ng-repeat=\"option in filter.options\"><div ng-class=\"{ 'disabled': !option.quantity,\n" +
    "                             'checkbox': filter.type == 'multiple',\n" +
    "                             'radio': filter.type == 'date' }\"><label ng-switch=\"\" on=\"filter.group\"><input name=\"{{ filter.url }}\" type=\"checkbox\" ng-if=\"filter.type == 'multiple'\" ng-change=\"updateQueryString()\" ng-model=\"option.active\" ng-checked=\"option.active\" ng-disabled=\"!option.quantity\"><input name=\"{{ filter.url }}\" type=\"radio\" ng-if=\"filter.type == 'date'\" ng-change=\"updateQueryString()\" ng-model=\"option.active\" ng-value=\"true\"><span ng-switch-when=\"date\" translate=\"\">{{(\"listing.dates.\" + option.name)}}</span> <span ng-switch-when=\"status\" translate=\"\">{{(\"transactions.status.\" + (option.name | capitalize))}}</span> <span ng-switch-default=\"\">{{ option.name }}</span> <span class=\"text-muted\">({{ option.quantity }})</span></label></div></li></ul><button class=\"btn\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.type === 'single' && filter.selectedItem\" translate=\"\">search.clear</button></accordion-group></accordion></div></div>"
  );
 });
(function() {
  angular.module('vtexNgFilter').directive('vtFilter', function($rootScope, $location, vtFilterService) {
    return {
      restrict: 'E',
      scope: {
        endpoint: '=endpoint'
      },
      templateUrl: 'vtex-ng-filter.html',
      link: function($scope) {
        var endpoint, filters, services;
        services = vtFilterService;
        filters = services.filters;
        endpoint = $scope.endpoint;
        $scope.groups = _.groupBy(filters, function(_f) {
          return _f.group;
        });
        $scope.activeFilters = services.activeFilters;
        $scope.clearAllFilters = function() {
          services.clearAllFilters();
          services.updateQueryString();
          return true;
        };
        $scope.updateQueryString = services.updateQueryString;
        services.setFilters(endpoint, filters, $location.search());
        return $scope.$on('$locationChangeSuccess', function() {
          return services.setFilters(endpoint, filters, $location.search());
        });
      }
    };
  }).directive('vtFilterSummary', function(vtFilterService, $rootScope) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'vtex-ng-filter-summary.html',
      link: function($scope) {
        var services;
        services = vtFilterService;
        $scope.activeFilters = services.activeFilters;
        return $scope.disableFilter = function(filter) {
          filter.active = false;
          $rootScope.$emit('filterRemoved', {
            filter: filter,
            location: 'summary'
          });
          return services.updateQueryString();
        };
      }
    };
  }).directive('vtFilterButton', function(vtFilterService) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'vtex-ng-filter-button.html',
      link: function($scope) {
        return $scope.activeFilters = vtFilterService.activeFilters;
      },
      controller: function($scope, $rootScope) {
        return $scope.openFilterSidebar = function() {
          $rootScope.sidebar.show('filters');
          return $rootScope.$emit('filterToggle', {
            status: 'opened'
          });
        };
      }
    };
  });

}).call(this);
