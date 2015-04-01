angular.module('vtexNgFilter')
  .factory 'DefaultIntervalFilter', ->
    class DefaultIntervalFilter
      constructor: ->
        return [ 
          { name: 'today',       interval: ['now-1d',  'now'] }
          { name: 'yesterday',   interval: ['now-2d',  'now-1d'] }
          { name: 'thisWeek',    interval: ['now-1w',  'now'] } 
          { name: 'oneWeekAgo',  interval: ['now-2w',  'now-1w'] } 
          { name: 'twoWeeksAgo', interval: ['now-3w',  'now-2w'] }
          { name: 'thisMonth',   interval: ['now-30d', 'now'] }
          { name: 'lastMonth',   interval: ['now-60d', 'now-30d'] }]

  .factory 'TransactionGroup', (TransactionFilter) ->
    class TransactionGroup
      constructor: ->
        arr = {}
        # DATES
        arr["startDate"] = 
          new TransactionFilter("startDate", "startDate", "date", "date")
        arr["authorizationDate"] = 
          new TransactionFilter("authorizationDate", "authorizationDate", "date", "date")
        arr["commitmentDate"] = 
          new TransactionFilter("commitmentDate", "commitmentDate", "date", "date")
        arr["cancelationDate"] = 
          new TransactionFilter("cancelationDate", "cancelationDate", "date", "date")
        
        # PAYMENT CONDITION
        arr["payments.paymentSystemName"] = 
          new TransactionFilter("paymentSystem", "payments.paymentSystemName", "multiple", "paymentCondition")
        arr["payments.installments"] = 
          new TransactionFilter("installments", "payments.installments", "multiple", "paymentCondition")
        
        # CHANNEL
        arr["payments.connectorName"] = 
          new TransactionFilter("connectorName", "payments.connectorName", "multiple", "channel")
        arr["payments.antifraudImplementation"] = 
          new TransactionFilter("antifraudImplementation", "payments.antifraudImplementation", "multiple", "channel")
        arr["salesChannel"] = 
          new TransactionFilter("salesChannel", "salesChannel", "multiple", "channel")
        
        # STATUS
        arr["status"] = 
          new TransactionFilter("status", "status", "multiple", "status")
        arr["payments.refunds"] = 
          new TransactionFilter("refunds", "payments.refunds", "multiple", "status")

        return arr

  .factory 'TransactionFilter', (DefaultIntervalFilter) ->
    class FilterOption
      constructor: (name, quantity, type, status) ->
        option = 
          name: name
          quantity: quantity
          active: status

        if type isnt 'date'
          option.value = name
        else
          intervals = new DefaultIntervalFilter()
          for range in intervals
            if range.name is name
              option.value = "#{range.interval[0]} TO #{range.interval[1]}"

        return option

    class TransactionFilter
      constructor: (name, url, type, group, range) ->
        @name = name
        @url = url
        @type = type
        @group = group
        @active = false
        @options = []
        if type is "date" and !range
          @range = new DefaultIntervalFilter()
        else @range = range

        @clearOptions = ->
          @options = []

        @setOptions = (name, quantity, status) ->
          _active = false
          for option in @options
            # Checa se existe algum filtro ativo
            if option.active then _active = true
            
            # Checa se já opção já existe e atualiza ela
            if name is option.name
              option.quantity = quantity
              option.status = status
              return option
          
          # Avisa que o filtro esta ativo caso o status 
          # seja positivo ou exista um filtro ativo
          @active = status || _active

          # Caso não exista opção, instância uma nova
          newOption = new FilterOption(name, quantity, @type, status)
          @options.push newOption

          return newOption