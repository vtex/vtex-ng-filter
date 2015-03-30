config =
  path: ''

openFilters = {}
moreOptionsShowFilters = {}

angular.module('vtexNgFilter', [])

  # Organiza filtro de datas
  .service "vtFilterService", ($http, TransactionGroup) ->
    getDateRangeFilter = (date) ->
      _d = "#{date.url}->"
      arr = []
      for range in date.range
        arr.push("#{range.name}[#{range.interval[0]} TO #{range.interval[1]}]")

      _d += arr.join(';')
      return _d

    # Monta parâmetro de filtros
    setFacetsQuery = (filters) ->
      querystring = "_facets="
      queries = []      

      _.each filters, (f) ->
        switch f.type
          when "multiple" then queries.push f.url
          when "date"  then queries.push getDateRangeFilter f

      return querystring += queries.join(',')

    transformSearch = (searchObj) ->
      basicFilters = new TransactionGroup()
      search = []
      for k,v of searchObj
        if basicFilters[k] then search.push "#{k}=#{v}"
      return search.join('&')

    # Retorna lista de filtros
    @getFacets = (endpoint, filters, search) ->
      url = "#{endpoint}?#{ setFacetsQuery( filters ) }"
      # Caso tenha uma busca, adiciona ela a URL e trás o resultado filtrado por ela
      if transformSearch(search) then url += "&#{transformSearch(search)}"
      $http.get(url).then (res) -> res.data

    return this

  .directive "vtFilter", ($rootScope, $location, TransactionGroup, vtFilterService) ->
      restrict: 'E'
      scope:
        endpoint: '=endpoint'
      templateUrl: if config.path then config.path + '/vtex-ng-filter.html' else 'vtex-ng-filter.html'
      link: ($scope) ->
        # Instância grupo default de filtros
        filters = new TransactionGroup()

        # Retorna filtros ativos na querystring que sejam válidos
        getActiveFilters = (search) ->
          obj = {}
          for k, v of search 
            if filters[k] then obj[k] = v.split(' OR ') 
          return obj

        setFilters = ->
          locationSearch = $location.search()
          
          # Com resultado da API, preenche filtros com opcões disponíveis
          vtFilterService.getFacets($scope.endpoint, filters, locationSearch).then (res) ->
            locationActiveFilters = getActiveFilters(locationSearch)
            
            _.each res, (categoryOptions, categoryName) -> 
              for filterName, filterQuantity of categoryOptions
                # Verifica se o filtro esta presente na querystring 
                # e altera o status dele para ativo
                if locationActiveFilters[categoryName]
                  for activeFilterName in locationActiveFilters[categoryName]
                    status = false
                    if activeFilterName is filterName
                      status = true
                      break

                # Instância os filtros dentro das categorias correspondentes
                filters[categoryName].setOptions(filterName, filterQuantity, status)

          # Group Filters by group to UI
          $scope.groups = _.groupBy filters, (_f) -> _f.group 

        $scope.updateQueryString = ->
          console.log 'FILTERS TO UPDATE QUERYSTRING', filters
          querystring = []
          query = {}

          for url, filter of filters
            for option in filter.options
              if option.active
                query[url] = query[url] || []
                query[url].push option.value

            if query[url]
              query[url] = query[url].join(' OR ')

          console.log 'Query Object', query


          for querieName, querieValue of query
            querystring.push "#{querieName}=#{querieValue}"

          querystring = querystring.join('&')

          console.log 'QueryString', querystring
          $location.search(querystring)

        # Handle search query
        # updateFiltersOnLocationSearch = ->
        #   for filter in filters
        #     searchQuery = $location.search()[filter.rangeUrlTemplate]
        #     # Se está na URL, está selected
        #     if searchQuery
        #       filter.setSelectedItems(searchQuery)
        #       filter.update()
        #     else filter.clearSelection()

        # When initializing the directive, get the selected filters from the url.
        # updateFiltersOnLocationSearch()

        # Start directive
        setFilters()

        # If url changes, update filters to match
        $scope.$on '$locationChangeSuccess', -> setFilters()
          # queryFilters = (_.map filters, (f) -> $location.search()[f.rangeUrlTemplate]).join() # filters on search
          # selectedFilters = (_.map filters, (f) -> f.getSelectedItemsURL()).join() # filters selected
          # return if decodeURIComponent(queryFilters) is selectedFilters
          # updateFiltersOnLocationSearch()

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

  .provider 'vtexNgFilter',
    config: config
    $get: (filter) -> filter
