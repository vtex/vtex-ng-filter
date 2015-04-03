angular.module('vtexNgFilter')
  .directive "vtFilter", ($rootScope, $location, vtFilterService) ->
    restrict: 'E'
    scope: endpoint: '=endpoint'
    templateUrl: 'vtex-ng-filter.html'
    link: ($scope) ->
      
      services = vtFilterService 
      filters = services.filters
      endpoint = $scope.endpoint

      # Group Filters by group to UI
      $scope.groups = _.groupBy filters, (_f) -> _f.group 
      $scope.activeFilters = services.activeFilters
      $scope.clearAllFilters = ->
        services.clearAllFilters()
        services.updateQueryString()
        return

      $scope.updateQueryString = services.updateQueryString

      # Start directive
      services.setFilters(endpoint)

      # If url changes, update filters to match
      $scope.$on '$locationChangeSuccess', -> services.setFilters(endpoint, true)

  .directive "vtFilterSummary", (vtFilterService) ->
    restrict: 'E'
    scope: true
    templateUrl: 'vtex-ng-filter-summary.html'
    link: ($scope) ->
      services = vtFilterService 

      $scope.activeFilters = services.activeFilters
      $scope.disableFilter = (filter) ->
        filter.active = false
        services.updateQueryString()

  .directive "vtFilterButton", (vtFilterService) ->
    restrict: 'E'
    scope: true
    templateUrl: 'vtex-ng-filter-button.html'
    link: ($scope) ->  $scope.activeFilters = vtFilterService.activeFilters