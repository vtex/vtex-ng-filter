config =
	path: ''

openFilters = {}
moreOptionsShowFilters = {}

angular.module('ngFilter', ["ui.bootstrap.accordion"])
	.directive "filter", ->
		restrict: 'E'
		scope:
			filters: '=filters'
		templateUrl: if config.path then config.path + '/ng-filter.html' else 'ng-filter.html'
		link: ($scope) ->
			# Initialize open filters if needed
			for filter in $scope.filters
				unless openFilters.hasOwnProperty(filter.rangeUrlTemplate)
					openFilters[filter.rangeUrlTemplate] = false

				unless moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)
					moreOptionsShowFilters[filter.rangeUrlTemplate] = false

				filter.selectedCount = 0
				filter.selectedCount++ for item in filter.items when item.selected
				filter.selectedCountLabel = if filter.selectedCount then "(#{filter.selectedCount})" else ""

			$scope.openFilters = openFilters
			$scope.moreOptionsShowFilters = moreOptionsShowFilters

			$scope.clearAll = ->
				for filter in $scope.filters
					for item in filter.items
						item.selected = false

	.provider 'vtexNgFilter',
		config: config
		$get: (filter) -> filter
