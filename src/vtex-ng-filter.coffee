angular.module('vtexNgFilter')
  .directive 'vtFilter', ($rootScope, $location, vtFilterService) ->
    restrict: 'E'
    scope:
      endpoint: '=endpoint'
    templateUrl: 'vtex-ng-filter.html'
    link: ($scope) ->

      services = vtFilterService
      filters = services.filters
      endpoint = $scope.endpoint

      $scope.groups = _.groupBy filters, (_f) -> _f.group
      $scope.activeFilters = services.activeFilters
      $scope.clearAllFilters = ->
        services.clearAllFilters()
        services.updateQueryString()
        return true

      $scope.updateQueryString = services.updateQueryString

      services.setFilters endpoint, filters, $location.search()
      
      $scope.$on '$locationChangeSuccess', -> services.setFilters endpoint, filters, $location.search()

  .directive 'vtFilterSummary', (vtFilterService, $rootScope) ->
    restrict: 'E'
    scope: true
    templateUrl: 'vtex-ng-filter-summary.html'
    link: ($scope) ->
      services = vtFilterService

      $scope.activeFilters = services.activeFilters
      $scope.disableFilter = (filter) ->
        filter.active = false
        $rootScope.$emit 'filterRemoved', filter: filter, location: 'summary'
        services.updateQueryString()

  .directive 'vtFilterButton', (vtFilterService) ->
    restrict: 'E'
    scope: true
    templateUrl: 'vtex-ng-filter-button.html'
    link: ($scope) ->  $scope.activeFilters = vtFilterService.activeFilters
    controller: ($scope, $rootScope) ->
      $scope.openFilterSidebar = ->
        $rootScope.sidebar.show 'filters'
        $rootScope.$emit 'filterToggle', status: 'opened'
