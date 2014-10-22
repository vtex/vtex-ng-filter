expect = chai.expect
mocha.setup 'bdd'

describe 'Filter', ->
  Filter = null
  filter = null

  beforeEach ->
    module 'vtexNgFilter'
    inject ($injector) -> Filter = $injector.get 'Filter'


  describe 'Date Filter', ->

    beforeEach -> filter = new Filter({ type: 'date', name: 'testDate' })

    it 'should have instantiated a new filter with "date" type', (done) ->
      expect(filter).to.be.an('object')
      expect(filter.type).to.equal('date')
      done()

    describe 'Proper handling timezone/daylight savings changes', (done) ->

      it 'should get correct dates considering from UTC -0200 and to -0200', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 02:00:00 GMT-0200 (BRST)')
          to: new Date('Wed Oct 23 2014 02:59:59 GMT-0200 (BRST)')

        expect(filter.getSelectedItems()[0].url).to.equal("testDate:[#{filter.date.from.toISOString()} TO #{filter.date.to.toISOString()}]")
        done()
