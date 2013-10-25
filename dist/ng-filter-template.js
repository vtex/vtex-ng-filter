angular.module("ngFilter").run(function($templateCache) { 
  $templateCache.put('ng-filter.html',
    "<div class=\"filters-block\">\n" +
    "\n" +
    "    <accordion close-others=\"false\" template-url=\"window.versionDirectory + 'lib/angular-ui/accordion.html'\">\n" +
    "        <accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" heading=\"{{ 'filters.' + filter.rangeUrlTemplate | translate }} {{ filter.selectedCountLabel }}\" ng-repeat=\"filter in filters\">\n" +
    "\n" +
    "            <div ng-switch=\"\" on=\"filter.type\">\n" +
    "                <div ng-switch-when=\"date\">\n" +
    "                    <p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(0)\" translate=\"\">listing.dates.today</a></p>\n" +
    "                    <p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-1)\" translate=\"\">listing.dates.yesterday</a></p>\n" +
    "                    <p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-7)\" translate=\"\">listing.dates.thisWeek</a></p>\n" +
    "                    <p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-30)\" translate=\"\">listing.dates.thisMonth</a></p>\n" +
    "                    <p><a href=\"javascript: void(0)\" ng-click=\"filter.clearSelection()\" translate=\"\">listing.dates.clearFilter</a></p>\n" +
    "                    <div class=\"input-append\">\n" +
    "                        <input type=\"text\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\" value=\"{{filter.dateRangeLabel()}}\" readonly=\"readonly\">\n" +
    "\n" +
    "                        <a href=\"javascript:void(0);\" class=\"add-on\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\"><i class=\"icon-calendar\"></i></a>\n" +
    "                    </div>\n" +
    "                    <div class=\"date-selectors\" ng-show=\"openFilters[filter.rangeUrlTemplate + 'Selector']\">\n" +
    "                        <div class=\"controls\">\n" +
    "                            <p translate=\"\">listing.dates.from</p>\n" +
    "                            <div class=\"well well-small pull-left\" ng-model=\"filter.date.from\">\n" +
    "                                <datepicker show-weeks=\"false\"></datepicker>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <div class=\"controls\">\n" +
    "                            <p translate=\"\">listing.dates.to</p>\n" +
    "                            <div class=\"well well-small pull-left\" ng-model=\"filter.date.to\">\n" +
    "                                <datepicker show-weeks=\"false\"></datepicker>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-default=\"\">\n" +
    "                    <ul class=\"filter-list nav nav-pills nav-stacked\">\n" +
    "                        <li ng-repeat=\"item in filter.items\" ng-show=\"$index < 5 || moreOptionsShowFilters[filter.rangeUrlTemplate]\">\n" +
    "                            <label class=\"checkbox\" ng-if=\"filter.type == 'multiple'\">\n" +
    "                                <input type=\"checkbox\" name=\"{{filter.name}}\" ng-model=\"item.selected\" ng-change=\"filter.updateSelectedCount()\">\n" +
    "                                <span>\n" +
    "                                    {{ item.name }} ({{ item.quantity }})\n" +
    "                                </span>\n" +
    "                            </label>\n" +
    "                            <label class=\"radio\" ng-if=\"filter.type == 'single'\">\n" +
    "                                <input type=\"radio\" name=\"{{filter.name}}\" ng-model=\"filter.selectedItem\" ng-value=\"item\">\n" +
    "                                <span>\n" +
    "                                    {{ item.name }} ({{ item.quantity }})\n" +
    "                                </span>\n" +
    "                            </label>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                    <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-show=\"filter.items.length > 5 && !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a>\n" +
    "                    <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-show=\"filter.items.length > 5 && moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsHide' | translate}}</a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </accordion-group>\n" +
    "    </accordion>\n" +
    "\n" +
    "    <button translate=\"\" class=\"btn pull-right\" ng-click=\"clearAll()\">listing.clearAll</button>\n" +
    "\n" +
    "</div>"
  );
 });