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
          @dateObjectCache = {}
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

        @updateSelectedCount()

      updateSelectedCount: =>
        if @type is 'date'
          @selectedCount = if @date.from and @date.to then 1 else 0
        else if @type is 'multiple'
          @selectedCount = (_.filter @items, (i) -> i.selected).length
        else if @type is 'single'
          @selectedCount = if @selectedItem then 1 else 0

        openFilters[@rangeUrlTemplate] = if @selectedCount is 0 then false else true
        @selectedCountLabel = if @selectedCount then "(#{@selectedCount})" else ""

      setSelectedItems: (itemsAsSearchParameter) =>
        if @type is 'date'
          items = itemsAsSearchParameter.replace(@name + ':[', '').replace(']', '').split(' TO ')
          date =
            from: new Date(items[0])
            to: new Date(items[1])
          @date = date
        else if @type is 'multiple'
          for item in @items
            item.selected = item.url in itemsAsSearchParameter.split(',')
        else if @type is 'single'
          @selectedItem = _.find @items, (i) -> i.url is itemsAsSearchParameter

        @updateSelectedCount()

      getSelectedItems: =>
        if @type is 'date'
          if @date.from and @date.to
            url = "#{@name}:[#{moment(@date.from).startOf('day').toISOString()} TO #{moment(@date.to).endOf('day').toISOString()}]"
            @dateObjectCache[url] or=
              name: @dateRangeLabel()
              url: url
            [@dateObjectCache[url]]
          else
            []
        else if @type is 'multiple'
          item for item in @items when item.selected
        else if @type is 'single'
          if @selectedItem then [@selectedItem] else []

      getSelectedItemsURL: =>
        selectedArray = _.map @getSelectedItems(), (i) -> i.url
        if selectedArray.length > 0 then selectedArray.join(',') else null

      clearItem: (itemObject) ->
        if @type in ['date', 'single']
          @clearSelection()
        else if @type is 'multiple'
          item.selected = false for item in @items when itemObject.url is item.url
          @updateSelectedCount()

      clearSelection: =>
        if @type is 'date'
          @date = {}
        else if @type is 'multiple'
          item.selected = false for item in @items
        else if @type is 'single'
          @selectedItem = null

        @updateSelectedCount()

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
