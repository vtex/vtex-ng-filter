config =
  path: ''

openFilters = {}
moreOptionsShowFilters = {}

angular.module('vtexNgFilter', [])
.factory 'Filter', (DateTransform, $location, $filter) ->
  class Filter
    constructor: (filter = {}) ->
      @[k] = v for k, v of filter

      @useTimezoneOffset = $location.search()['p_f_useUserTimezone'] or true
      @currentTimezoneOffset = do ->
        offset = (new Date().getTimezoneOffset() / 60)
        symbol = if parseInt(offset) >= 0 then '+' else ''
        label: (symbol + offset + 'h'), value: offset

      @onUseTimezoneOffsetChange = =>
        $location.search 'p_f_useUserTimezone', @useTimezoneOffset

      @setGroup()
      @selectedCount = 0

      if @type is 'date'
        @dateObjectCache = {}

        dateGetterSetter = (date, propertyName) =>
          if angular.isDefined(date) then @[propertyName] = date else @[propertyName] ? false

        @date = {}
        @today = DateTransform.endOfDay(new Date(), @useTimezoneOffset)

        @setDates = (offsetFrom = 0, offsetTo = 0, currentMonth = false) =>
          if !currentMonth? or currentMonth is false
            date =
              from: moment().add('d', offsetFrom).toDate()
              to: moment().add('d', offsetTo).toDate()
          else
            date =
              from: moment().startOf('month').toDate()
              to: moment().endOf('month').toDate()

          @date =
            from: DateTransform.startOfDay(date.from, @useTimezoneOffset)
            to: DateTransform.startOfDay(date.to, @useTimezoneOffset)

        @dateRangeLabel = =>
          if @date.from and @date.to
            if DateTransform.startOfDay(@date.from, @useTimezoneOffset).toString() is DateTransform.startOfDay(new Date(), @useTimezoneOffset).toString()
                $filter('translate')('listing.dates.today')
            else if moment(@date.from) is DateTransform.startOfDay(moment().add('d', -1), @useTimezoneOffset) and
              moment(@date.to).toISOString() is DateTransform.endOfDay(moment().add('d', -1), @useTimezoneOffset).toISOString()
                $filter('translate')('listing.dates.yesterday')
            else if moment(@date.from).isSame(moment().startOf('month').toDate()) and
              moment(@date.to).isSame(moment().endOf('month').toDate())
                $filter('translate')('listing.dates.currentMonth')
            else if DateTransform.startOfDay(@date.to, @useTimezoneOffset).toISOString() is DateTransform.startOfDay(new Date(), @useTimezoneOffset).toISOString()
              "#{moment(@date.from).add('hours', moment().hours()).fromNow()} #{$filter('translate')('listing.dates.untilToday')}"
            else
              "#{moment(@date.from).add('hours', moment().hours()).fromNow()} #{$filter('translate')('listing.dates.until')} #{moment(@date.to).add('hours', moment().hours()).fromNow()}"
          else
            $filter('translate')('listing.dates.noRangeSelected')

      @updateSelectedCount()

    updateSelectedCount: =>
      if @type is 'date'
        @selectedCount = if @date.from and @date.to then 1 else 0
      else if @type is 'multiple'
        (lastSelectedItemIndex = i if item.selected) for item, i in @items
        moreOptionsShowFilters[@rangeUrlTemplate] = true if lastSelectedItemIndex > 4
        @selectedCount = (_.filter @items, (i) -> i.selected).length
      else if @type is 'single'
        (selectedItemIndex = i if item is @selectedItem) for item, i in @items
        moreOptionsShowFilters[@rangeUrlTemplate] = true if selectedItemIndex > 4
        @selectedCount = if @selectedItem then 1 else 0

      openFilters[@rangeUrlTemplate] = true if @selectedCount > 0
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
          url = @name + ":[" + DateTransform.startOfDay(@date.from, @useTimezoneOffset).toISOString() + " TO " + DateTransform.endOfDay(@date.to, @useTimezoneOffset).toISOString() + "]"
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

    setGroup: =>
      if @name in ['creationDate', 'authorizedDate', 'ShippingEstimatedDate', 'invoicedDate']
        @groupName = 'date'
      else if @name in ['SalesChannelName', 'CallCenterOperatorName', 'SellerNames', 'UtmSource', 'affiliateId']
        @groupName = 'channel'
      else if @name in ['StatusDescription', 'orderSituation', 'errorStatus']
        @groupName = 'status'
      else
        @groupName = 'other'

# To use instead of moment's due to weird date bug
.service 'DateTransform', ->
  @startOfDay = (dateStr, useTimezoneOffset = true) ->
    date = new Date dateStr
    date.setHours 0, 0, 0, 0
    date.setHours 0, -date.getTimezoneOffset() if not useTimezoneOffset
    return date

  @endOfDay = (dateStr, useTimezoneOffset = true) ->
    date = new Date dateStr
    date.setHours 23, 59, 59, 999
    date.setHours 23, -(date.getTimezoneOffset() - 59) if not useTimezoneOffset
    return date

  @validate = (date) ->
    return unless date?
    date = new Date date
    date.setDate(date.getUTCDate()) if date.getUTCDate() isnt date.getDate()
    return date

  return this


.directive 'vtFilter', ($rootScope, $location, DateTransform) ->
  restrict: 'E'
  scope:
    filters: '=filters'
  templateUrl: if config.path then config.path + '/vtex-ng-filter.html' else 'vtex-ng-filter.html'
  link: ($scope) ->
    filters = _.flatten $scope.filters
    # Initialize open filters if needed
    for filter in filters
      unless openFilters.hasOwnProperty(filter.rangeUrlTemplate)
        openFilters[filter.rangeUrlTemplate] = false

      unless moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)
        moreOptionsShowFilters[filter.rangeUrlTemplate] = false

    $scope.openFilters = openFilters
    $scope.moreOptionsShowFilters = moreOptionsShowFilters

    $scope.clearAll = -> filter.clearSelection() for filter in filters
    $scope.filters.getAppliedFilters = -> _.filter filters, (f) -> f.getSelectedItems().length > 0
    $scope.filters.getAppliedItems = -> _.chain($scope.filters.getAppliedFilters()).map((f) -> f.getSelectedItems()).flatten().value()

    # Handle search query
    updateFiltersOnLocationSearch = ->
      for filter in filters
        searchQuery = $location.search()[filter.rangeUrlTemplate]
        # Se está na URL, está selected
        if searchQuery
          filter.setSelectedItems decodeURIComponent(searchQuery)
          filter.update()
        else filter.clearSelection()

    # When initializing the directive, get the selected filters from the url.
    updateFiltersOnLocationSearch()

    $scope.$on '$locationChangeStart', ->
      for k, v of $location.search()
        $location.search k, decodeURIComponent v

    # If url changes, update filters to match
    $scope.$on '$locationChangeSuccess', ->
      queryFilters = (_.map filters, (f) -> $location.search()[f.rangeUrlTemplate]).join() # filters on search
      selectedFilters = (_.map filters, (f) -> f.getSelectedItemsURL()).join() # filters selected
      return if decodeURIComponent(queryFilters) is selectedFilters
      updateFiltersOnLocationSearch()

    # Watch filters to modify search query
    _.each filters, (filter, i) ->
      $scope.$watch ((scope) -> _.flatten(scope.filters)[i].getSelectedItemsURL()), (newValue, oldValue) ->
        return if newValue is oldValue
        if filter.type is 'date' and filter.date?
          filters[i].date.from = DateTransform.validate(filter.date.from)
          filters[i].date.to = DateTransform.validate(filter.date.to)
          $rootScope.$digest() unless $rootScope.$$phase
        for filter in filters
          $location.search filter.rangeUrlTemplate, filter.getSelectedItemsURL()
        # Sets paging to 1 on modified filters
        $location.search 'page', 1

.directive 'vtFilterSummary', ->
  restrict: 'E'
  scope:
    filters: '=filters'
  templateUrl: if config.path then config.path + '/vtex-ng-filter-summary.html' else 'vtex-ng-filter-summary.html'

.directive 'vtFilterButton', ->
  restrict: 'E'
  scope:
    filters: '=filters'
    openFilters: '&'
  templateUrl: if config.path then config.path + '/vtex-ng-filter-button.html' else 'vtex-ng-filter-button.html'

.provider 'vtexNgFilter',
  config: config
  $get: (filter) -> filter
