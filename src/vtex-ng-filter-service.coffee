angular.module('vtexNgFilter')

  # Organiza filtro de datas
  .service "vtFilterService", ($http, $location, TransactionGroup) ->
    self = @
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

    # 
    # PUBLIC
    # 

    # Instância grupo default de filtros    
    self.filters = new TransactionGroup()

    self.activeFilters = list: []

    self.updateQueryString = ->
      querystring = []
      query = {}

      for url, filter of self.filters
        for option in filter.options
          if option.active
            query[url] = query[url] || []
            query[url].push option.value

        if query[url]
          query[url] = query[url].join(' OR ')

      for querieName, querieValue of query
        querystring.push "#{querieName}=#{querieValue}"

      querystring = querystring.join('&')

      $location.search(querystring)

    self.setFilters = (endpoint, clear) ->
      locationSearch = $location.search()
      
      # Com resultado da API, preenche filtros com opcões disponíveis
      self.getFacets(endpoint, self.filters, locationSearch).then (res) ->
        locationActiveFilters = self.getActiveFilters(locationSearch, self.filters)

        # Lista de filtros ativos 
        self.activeFilters.list = []

        _.each res, (categoryOptions, categoryName) -> 
          
          # Limpa opções antes de criar novas
          # Opção usada quando usuário atualiza a lista
          # removendo filtros não mais existentes
          if clear then self.filters[categoryName].clearOptions()
          
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
            if filterQuantity
              option = self.filters[categoryName].setOptions(filterName, filterQuantity, status)
              # Popula array de filtros ativos
              self.activeFilters.list.push option if option.active

    # Retorna filtros ativos na querystring que sejam válidos
    self.getActiveFilters = (search, filters) ->
      obj = {}
      for k, v of search 
        if filters[k] then obj[k] = v.split(' OR ') 
      return obj

    # Retorna lista de filtros
    self.getFacets = (endpoint, filters, search) ->
      url = "#{endpoint}?#{ setFacetsQuery( filters ) }"
      # Caso tenha uma busca, adiciona ela a URL e trás o resultado filtrado por ela
      if transformSearch(search) then url += "&#{transformSearch(search)}"
      $http.get(url).then (res) -> res.data

    return self