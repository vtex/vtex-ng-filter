config =
	path: ''

openFilters = {}
moreOptionsShowFilters = {}

angular.module('ngFilter', ["ui.bootstrap.accordion"])
  .factory "Filter", ($translate) ->
    class Filter
      constructor: (filter) ->
        for k, v of filter
          @[k] = v

        @selectedCount = 0

        if @type is 'date'
          @date = {}

          @setDates = (offset) =>
            date =
              from: moment().add('d', offset).startOf('day').toDate()
              to: moment().endOf('day').toDate()
            @date = date

          @dateRangeLabel = =>
            if @date.from and @date.to
              if moment(@date.from).startOf('day').isSame(moment().startOf('day'))
                $translate('listing.dates.today')
              else if moment(@date.to).startOf('day').isSame(moment().startOf('day'))
                "#{moment(@date.from).add('hours', moment().hours()).fromNow()} #{$translate('listing.dates.untilToday')}"
              else
                "#{moment(@date.from).add('hours', moment().hours()).fromNow()} #{$translate('listing.dates.until')} #{moment(@date.to).add('hours', moment().hours()).fromNow()}"
            else
              $translate('listing.dates.noRangeSelected')
        else
          @selectedCount++ for item in @items when item.selected

        @selectedCountLabel = if @selectedCount then "(#{@selectedCount})" else ""

      setSelectedItems: (itemsAsSearchParameter) =>
        if @type is 'date'
          @selectedCount = 1
          items = itemsAsSearchParameter.replace(@name + ':[', '').replace(']', '').split(' TO ')
          date =
            from: new Date(items[0])
            to: new Date(items[1])
          @date = date
        else
          @selectedCount = 0
          for item in @items
            if item.url in itemsAsSearchParameter.split(',')
              item.selected = true
              @selectedCount++

        @selectedCountLabel = "(#{@selectedCount})"

      getSelectedItems: =>
        if @type is 'date'
          if @date.from and @date.to
            [@name + ":[#{moment(@date.from).startOf('day').toISOString()} TO #{moment(@date.to).endOf('day').toISOString()}]"]
          else
            []
        else
          item.url for item in @items when item.selected

      clearSelection: =>
        @selectedCount = 0
        @selectedCountLabel = ""
        if @type is 'date'
          @date = {}
        else
          item.selected = false for item in @items

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

			$scope.openFilters = openFilters
			$scope.moreOptionsShowFilters = moreOptionsShowFilters

			$scope.clearAll = ->
				filter.clearSelection() for filter in $scope.filters

	.provider 'vtexNgFilter',
		config: config
		$get: (filter) -> filter
