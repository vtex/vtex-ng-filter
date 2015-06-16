angular.module('vtexNgFilter')
.service "vtFilterService", ($http, $location, TransactionGroup, DefaultIntervalFilter) ->

  self = @
  baseInterval = new DefaultIntervalFilter()

  getDateRangeFilter = (date) ->
    _d = "#{date.url}->"
    arr = []
    for range in date.range
      arr.push("#{range.name}#{range.interval}")

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

  #
  # PUBLIC
  #

  # Instância grupo default de filtros
  self.filters = new TransactionGroup()

  self.activeFilters = list: []

  self.updateQueryString = () ->
    query = {}

    for url, filter of self.filters
      query[url] = query[url] || []

      for option in filter.options
        if option.active then query[url].push option.value

      if query[url].length then query[url] = query[url].join(' OR ') else query[url] = null

    for querieName, querieValue of query
      $location.search querieName, querieValue

  self.clearAllFilters = ->
    self.filters = _.each self.filters, (f) ->
      f.active = false
      _.each f.options, (o) -> o.active = false

  self.setFilters = (endpoint, filters, search) ->
    locationActiveFilters = self.getQueryStringFilters(search, filters)

    console.log '-------------'
    console.log 'ACTIVE FILTERS', locationActiveFilters
    # Lista de filtros ativos
    self.activeFilters.list = []

    # Com resultado da API, preenche filtros com opcões disponíveis
    self.getAvailableFacets(endpoint, filters, search).then (res) ->
      _.each res, (categoryOptions, categoryName) ->
        # Limpa opções antes de criar novas
        # Opção usada quando usuário atualiza a lista
        # removendo filtros não mais existentes
        filters[categoryName].clearOptions()

        for filterName, filterQuantity of categoryOptions
          # Verifica se o filtro esta presente na querystring
          # e altera o status dele para ativo
          if locationActiveFilters[categoryName]
            for activeFilterName in locationActiveFilters[categoryName]
              status = if activeFilterName is filterName then activeFilterName
              break if status

          # Transforma Value do option em booleano caso seja um checkbox
          # necessário por conta do angular boboca
          if filters[categoryName].type is "multiple" then status = !!status

          # Instância os filtros dentro das categorias correspondentes
          option = filters[categoryName].setOptions(filterName, filterQuantity, status)

          # Popula array de filtros ativos
          self.activeFilters.list.push option if option.active

  # Retorna filtros ativos na querystring que sejam válidos
  self.getQueryStringFilters = (search, filters) ->
    obj = {}
    for k, v of search
      if filters[k]
        # Caso seja uma data, retorna o name correspondente ao intervalo
        if filters[k].type is 'date'
          interval = _.find baseInterval, (i) -> i.interval is v
          v = interval.name
        obj[k] = v.split(' OR ')
    return obj

  # Retorna lista de filtros
  self.getAvailableFacets = (endpoint, filters, search) ->
    url = "#{endpoint}?#{ setFacetsQuery( filters ) }"
    # Caso tenha uma busca, adiciona ela a URL e trás o resultado filtrado por ela
    if transformSearch(search) then url += "&#{transformSearch(search)}"
    $http.get(url).then (res) -> res.data


  return self
