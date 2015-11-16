angular.module('vtexNgFilter')
.service 'vtFilterService', ($http, $location, $rootScope, TransactionGroup, DefaultIntervalFilter) ->

  baseInterval = new DefaultIntervalFilter()

  @filters = new TransactionGroup()
  @activeFilters =
    list: []

  getDateRangeFilter = (date) ->
    _d = "#{date.url}->"
    arr = []
    arr.push("#{range.name}#{range.interval}") for range in date.range

    _d += arr.join(';')
    return _d

  # Monta parâmetro de filtros
  setFacetsQuery = (filters) ->
    querystring = "_facets="
    queries = []

    _.each filters, (f) ->
      switch f.type
        when 'multiple' then queries.push f.url
        when 'date' then queries.push getDateRangeFilter f

    return querystring += queries.join ','

  transformSearch = (searchObj) ->
    basicFilters = new TransactionGroup()
    search = []
    search.push "#{k}=#{v}" for k, v of searchObj when basicFilters[k]
    search.join '&'

  @updateQueryString = =>
    console.log 'Updating query string...'
    query = {}

    for facet, filter of @filters
      query[facet] = query[facet] or []

      if filter?.options?.length
        query[facet].push option.value for option in filter.options when option.active

      if query[facet].length
        query[facet] = query[facet].join(' OR ')
      else query[facet] = null

    $rootScope.$emit 'filterChanged', query
    $location.search query

  @clearAllFilters = =>
    @filters = _.map @filters, (f) ->
      f.active = false
      f.options = _.map f.options, (o) -> o.active = false

  @setFilters = (endpoint, filters, search) =>
    locationActiveFilters = @getQueryStringFilters search, filters
    @activeFilters.list = []

    @getAvailableFacets(endpoint, filters, search).then (res) =>
      _.each res, (categoryOptions, categoryName) =>
        filters[categoryName].clearOptions()

        for filterName, filterQuantity of categoryOptions
          if locationActiveFilters[categoryName]
            for activeFilterName in locationActiveFilters[categoryName]
              status = if activeFilterName.indexOf(filterName) >= 0 then activeFilterName
              break if status

          if filters[categoryName].type is 'multiple'
            status = true if status is 'true'
            status = false if status is 'false'

          option = filters[categoryName].setOptions filterName, filterQuantity, status
          @activeFilters.list.push option if option.active

  @getQueryStringFilters = (search, filters) ->
    obj = {}
    for k, v of search when filters[k]
      if filters[k].type is 'date'
        interval = _.find baseInterval, (i) -> i.interval is v
        v = interval.name
      obj[k] = v.split ' OR '
    return obj

  @getAvailableFacets = (endpoint, filters, search) ->
    url = "#{endpoint}?#{ setFacetsQuery( filters ) }"
    url += "&#{transformSearch(search)}" if transformSearch search
    $http.get(url).then (res) -> res.data


  return this
