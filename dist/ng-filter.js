(function() {
  var config, moreOptionsShowFilters, openFilters,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('ngFilter', ["ui.bootstrap.accordion"]).factory("Filter", function($translate) {
    var Filter;
    return Filter = (function() {
      function Filter(filter) {
        this.clearSelection = __bind(this.clearSelection, this);
        this.getSelectedItemsURL = __bind(this.getSelectedItemsURL, this);
        this.getSelectedItems = __bind(this.getSelectedItems, this);
        this.setSelectedItems = __bind(this.setSelectedItems, this);
        this.updateSelectedCount = __bind(this.updateSelectedCount, this);
        var k, v,
          _this = this;
        for (k in filter) {
          v = filter[k];
          this[k] = v;
        }
        this.selectedCount = 0;
        if (this.type === 'date') {
          this.dateObjectCache = {};
          this.date = {};
          this.today = moment().endOf('day').toDate();
          this.setDates = function(offsetFrom, offsetTo) {
            var date;
            if (offsetFrom == null) {
              offsetFrom = 0;
            }
            if (offsetTo == null) {
              offsetTo = 0;
            }
            date = {
              from: moment().add('d', offsetFrom).startOf('day').toDate(),
              to: moment().add('d', offsetTo).endOf('day').toDate()
            };
            return _this.date = date;
          };
          this.dateRangeLabel = function() {
            if (_this.date.from && _this.date.to) {
              if (moment(_this.date.from).startOf('day').isSame(moment().startOf('day'))) {
                return $translate('listing.dates.today');
              } else if (moment(_this.date.from).isSame(moment().add('d', -1).startOf('day')) && moment(_this.date.to).isSame(moment().add('d', -1).endOf('day'))) {
                return $translate('listing.dates.yesterday');
              } else if (moment(_this.date.to).startOf('day').isSame(moment().startOf('day'))) {
                return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($translate('listing.dates.untilToday'));
              } else {
                return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($translate('listing.dates.until')) + " " + (moment(_this.date.to).add('hours', moment().hours()).fromNow());
              }
            } else {
              return $translate('listing.dates.noRangeSelected');
            }
          };
        }
        this.updateSelectedCount();
      }

      Filter.prototype.updateSelectedCount = function() {
        if (this.type === 'date') {
          this.selectedCount = this.date.from && this.date.to ? 1 : 0;
        } else if (this.type === 'multiple') {
          this.selectedCount = (_.filter(this.items, function(i) {
            return i.selected;
          })).length;
        } else if (this.type === 'single') {
          this.selectedCount = this.selectedItem ? 1 : 0;
        }
        openFilters[this.rangeUrlTemplate] = this.selectedCount === 0 ? false : true;
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
            url = "" + this.name + ":[" + (moment(this.date.from).startOf('day').toISOString()) + " TO " + (moment(this.date.to).endOf('day').toISOString()) + "]";
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

      return Filter;

    })();
  }).directive("filter", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/ng-filter.html' : 'ng-filter.html',
      link: function($scope) {
        var filter, _i, _len, _ref;
        _ref = $scope.filters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          if (!openFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            openFilters[filter.rangeUrlTemplate] = false;
          }
          if (!moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            moreOptionsShowFilters[filter.rangeUrlTemplate] = false;
          }
        }
        $scope.openFilters = openFilters;
        $scope.moreOptionsShowFilters = moreOptionsShowFilters;
        return $scope.clearAll = function() {
          var _j, _len1, _ref1, _results;
          _ref1 = $scope.filters;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            filter = _ref1[_j];
            _results.push(filter.clearSelection());
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
