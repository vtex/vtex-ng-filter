expect = chai.expect

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

      it '#dateStartOfDay should get correct start of day datetime', (done) ->
        date = new Date('Wed Oct 22 2014 04:32:11 GMT-0300 (BRST)')
        expect(filter.dateStartOfDay(date)).to.be.a('date')
        expect(filter.dateStartOfDay(date).toISOString()).to.equal('2014-10-22T02:00:00.000Z')
        done()

      it '#dateEndOfDay should get correct end of day datetime', (done) ->
        date = new Date('Wed Oct 22 2014 04:32:011 GMT-0300 (BRST)')
        expect(filter.dateEndOfDay(date)).to.be.a('date')
        expect(filter.dateEndOfDay(date).toISOString()).to.equal('2014-10-23T01:59:59.999Z')
        done()

      it '#getSelectedItems should get correct dates considering from GMT -0300 to -0300', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()

      it '#getSelectedItems should get correct dates considering from GMT -0200 to -0300', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0200 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()

      it '#getSelectedItems should get correct dates considering from GMT -0300 to -0200', (done) ->
        filter.date =
          from: new Date('Wed Oct 22 2014 00:00:00 GMT-0300 (BRST)')
          to: new Date('Wed Oct 22 2014 00:00:00 GMT-0200 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-22T02:00:00.000Z TO 2014-10-23T01:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()

      it '#getSelectedItems should get correct dates even if it\'s moving to DST on the same day', (done) ->
        filter.date =
          from: new Date('Wed Oct 18 2014 00:00:00 GMT-0300 (BRST)')
          to: new Date('Wed Oct 18 2014 00:00:00 GMT-0300 (BRST)')

        dateQueryString = "#{filter.name}:[2014-10-18T03:00:00.000Z TO 2014-10-19T02:59:59.999Z]"

        expect(filter.getSelectedItems()[0].url).to.equal(dateQueryString)
        done()
