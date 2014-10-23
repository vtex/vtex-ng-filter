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

    describe 'Proper handling timezone/daylight savings changes', ->

      it 'should get correct dates considering from GMT -0300 to -0300', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()

      it 'should get correct dates considering from GMT -0200 to -0300', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0200 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()

      it 'should get correct dates considering from GMT -0300 to -0200', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0200 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()
