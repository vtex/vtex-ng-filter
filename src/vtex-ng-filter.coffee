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
        return true

      $scope.updateQueryString = services.updateQueryString

      # Start directive
      services.setFilters(endpoint, filters).then (data) ->
        # Checa se existe alguma busca existente 
        # e pede novamente os filtros com parametros de busca
        search = $location.search()
        if Object.keys(search).length then services.setFilters(endpoint, filters, search)

      # If url changes, update filters to match
      $scope.$on '$locationChangeSuccess', -> services.setFilters(endpoint, filters, $location.search())

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