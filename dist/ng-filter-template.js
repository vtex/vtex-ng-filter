angular.module("ngFilter").run(function($templateCache) { 
  $templateCache.put('ng-filter.html',
    "<div class=\"filters-block\">\n" +
    "\n" +
    "    <accordion close-others=\"false\" template-url=\"window.versionDirectory + 'lib/angular-ui/accordion.html'\">\n" +
    "        <accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" heading=\"{{ 'filters.' + filter.rangeUrlTemplate | translate }} {{ filter.selectedCountLabel }}\" ng-repeat=\"filter in filters\">\n" +
    "            <ul class=\"filter-list nav nav-pills nav-stacked\">\n" +
    "                <li ng-repeat=\"item in filter.items\" ng-show=\"$index < 5 || moreOptionsShowFilters[filter.rangeUrlTemplate]\">\n" +
    "                    <label class=\"checkbox inline\">\n" +
    "                        <input type=\"checkbox\" ng-model=\"item.selected\">\n" +
    "                        <span class=\"\">{{ item.name }} ({{ item.quantity }})</span>\n" +
    "                    </label>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "            <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-show=\"filter.items.length > 5 && !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a>\n" +
    "            <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-show=\"filter.items.length > 5 && moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"muted\">{{ 'filters.moreOptionsHide' | translate}}</a>\n" +
    "        </accordion-group>\n" +
    "    </accordion>\n" +
    "\n" +
    "    <button translate=\"\" class=\"btn pull-right\" ng-click=\"clearAll()\">listing.clearAll</button>\n" +
    "\n" +
    "</div>"
  );
 });