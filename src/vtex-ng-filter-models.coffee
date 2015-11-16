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
      @startDate = new TransactionFilter 'startDate', 'startDate', 'date', 'date'
      @authorizationDate = new TransactionFilter 'authorizationDate', 'authorizationDate', 'date', 'date'
      @commitmentDate = new TransactionFilter 'commitmentDate', 'commitmentDate', 'date', 'date'
      @cancelationDate = new TransactionFilter 'cancelationDate', 'cancelationDate', 'date', 'date'
      @salesChannel = new TransactionFilter 'salesChannel', 'salesChannel', 'multiple', 'channel'
      @status = new TransactionFilter 'status', 'status', 'multiple', 'status'
      @payments =
        paymentSystemName: new TransactionFilter 'paymentSystem', 'payments.paymentSystemName', 'multiple', 'paymentCondition'
        installments: new TransactionFilter 'installments', 'payments.installments', 'multiple', 'paymentCondition'
        connectorName: new TransactionFilter 'connectorName', 'payments.connectorName', 'multiple', 'channel'
        antifraudImplementation: new TransactionFilter 'antifraudImplementation', 'payments.antifraudImplementation', 'multiple', 'channel'
        refunds: new TransactionFilter 'refunds', 'payments.refunds', 'multiple', 'status'

.factory 'TransactionFilter', (DefaultIntervalFilter) ->
  class FilterOption
    constructor: (name, quantity, type, status, group, filterName) ->
      @option =
        name: name
        quantity: quantity
        active: status
        group: group
        filterName: filterName

      if type isnt 'date'
        @option.value = do (name) ->
          if typeof name is 'string' and name.indexOf(' ') >= 0 then "'#{name}'" else name
      else
        for range in new DefaultIntervalFilter()
          @option.value = range.interval if range.name is name

      return @option

  class TransactionFilter
    constructor: (name, url, type, group, range) ->
      @name = name
      @url = url
      @type = type
      @group = group
      @active = false
      @range = new DefaultIntervalFilter() if type is 'date' and not @range
      @options = []

    clearOptions: =>
      for option in @options
        option.active = false
        option.quantity = 0

    setOptions: (name, quantity, status, group = @group) =>
      updatedOption = false
      isActive = false
      status = if status then true else false

      for option in @options when name is option.name
        isActive or= option.active
        option.quantity = quantity
        option.active = status
        updatedOption = option

      @active = status or isActive

      return updatedOption if updatedOption

      newOption = new FilterOption name, quantity, @type, status, group, @name
      @options.push newOption

      return newOption
