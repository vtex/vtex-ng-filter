angular.module('vtexNgFilter')
.factory 'DefaultIntervalFilter', ->
  class DefaultIntervalFilter
    constructor: ->
      return [
        { name: 'today',       interval: '[now-1d TO now]' }
        { name: 'yesterday',   interval: '[now-2d TO now-1d]' }
        { name: 'thisWeek',    interval: '[now-1w TO now]' }
        { name: 'oneWeekAgo',  interval: '[now-2w TO now-1w]' }
        { name: 'twoWeeksAgo', interval: '[now-3w TO now-2w]' }
        { name: 'thisMonth',   interval: '[now-30d TO now]' }
        { name: 'lastMonth',   interval: '[now-60d TO now-30d]' }]

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
    constructor: (name, quantity, type, status, group, filterName) ->
      option =
        name: name
        quantity: quantity
        active: status
        group: group
        filterName: filterName

      if type isnt 'date'
        option.value = do (name) ->
          name = '"' + name  + '"' if typeof name is 'string' and name.indexOf(' ') >= 0
          return name
      else
        intervals = new DefaultIntervalFilter()
        for range in intervals
          if range.name is name then option.value = range.interval

      return option

  class TransactionFilter
    constructor: (name, url, type, group, range) ->
      self = @

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
        self.options = _.map self.options, (o) ->
          o.active = false
          o.quantity = 0
          return o

      @setOptions = (name, quantity, status) ->
        updatedOption = false
        _active = false
        for option in self.options
          _active = _active || option.active
          # Checa se já opção já existe e atualiza ela
          if name is option.name
            option.quantity = quantity
            option.active = status
            updatedOption = option

        self.active = status || _active

        if updatedOption
          return updatedOption
        else
          # Caso não exista opção, instância uma nova
          newOption = new FilterOption(name, quantity, self.type, status, group, self.name)
          self.options.push newOption

          return newOption
