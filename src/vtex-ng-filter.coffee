config =
  path: ''

openFilters = {}
moreOptionsShowFilters = {}

angular.module('vtexNgFilter', ["ui.bootstrap.accordion"])
  .factory "Filter", ($translate) ->
    class Filter
      constructor: (filter) ->
        for k, v of filter
          @[k] = v

        @selectedCount = 0

        if @type is 'date'
          @dateObjectCache = {}
          @date = {}
          @today = moment().endOf('day').toDate()

          @setDates = (offsetFrom = 0, offsetTo = 0) =>
            date =
              from: moment().add('d', offsetFrom).startOf('day').toDate()
              to: moment().add('d', offsetTo).endOf('day').toDate()
            @date = date

          @dateRangeLabel = =>
            if @date.from and @date.to
              if moment(@date.from).startOf('day').isSame(moment().startOf('day'))
                  $translate('listing.dates.today')
              else if moment(@date.from).isSame(moment().add('d', -1).startOf('day')) and
                moment(@date.to).isSame(moment().add('d', -1).endOf('day'))
                  $translate('listing.dates.yesterday')
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

      update: (filterJSON = @) =>
        for item in @items
          updatedItem = _.find filterJSON.items, (i) -> i.name is item.name
          if updatedItem and @getSelectedItems()?.length is 0
            item.quantity = updatedItem.quantity
          else
            item.quantity = 0

  .directive "vtFilter", ($location) ->
    restrict: 'E'
    scope:
      filters: '=filters'
    templateUrl: if config.path then config.path + '/vtex-ng-filter.html' else 'vtex-ng-filter.html'
    link: ($scope) ->
      filters = $scope.filters
      # Initialize open filters if needed
      for filter in filters
        unless openFilters.hasOwnProperty(filter.rangeUrlTemplate)
          openFilters[filter.rangeUrlTemplate] = false

        unless moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)
          moreOptionsShowFilters[filter.rangeUrlTemplate] = false

      $scope.openFilters = openFilters
      $scope.moreOptionsShowFilters = moreOptionsShowFilters

      $scope.clearAll = ->
        filter.clearSelection() for filter in filters

      filters.getAppliedFilters = -> _.filter filters, (f) -> f.getSelectedItems().length > 0
      filters.getAppliedItems = -> _.chain(filters.getAppliedFilters()).map((f) -> f.getSelectedItems()).flatten().value()

      # Handle search query
      locationSearch = $location.search()
      for filter in filters
        searchQuery = locationSearch[filter.rangeUrlTemplate]
        # Se está na URL, está selected
        if searchQuery
          filter.setSelectedItems(searchQuery)
          filter.update()

      # Watch filters to modify search query
      $scope.$watch 'filters', ( (newValue, oldValue) ->
        return if newValue is oldValue
        for filter in filters
          $location.search filter.rangeUrlTemplate, filter.getSelectedItemsURL()
        # Sets paging to 1 on modified filters
        $location.search 'page', 1
      ), true

  .directive "vtFilterSummary", ->
    restrict: 'E'
    scope:
      filters: '=filters'
    templateUrl: if config.path then config.path + '/vtex-ng-filter-summary.html' else 'vtex-ng-filter-summary.html'

  .directive "vtFilterButton", ->
    restrict: 'E'
    scope:
      filters: '=filters'
      openFilters: '&'
    templateUrl: if config.path then config.path + '/vtex-ng-filter-button.html' else 'vtex-ng-filter-button.html'
    link: ($scope) ->

  .provider 'vtexNgFilter',
    config: config
    $get: (filter) -> filter
