var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ readFileSync()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-readfile-sync')
    rimraf(TEST_DIR, function () {
      fs.mkdir(TEST_DIR, done)
    })
  })

  afterEach(function (done) {
    rimraf(TEST_DIR, done)
  })

  it('should read and parse JSON', function () {
    var file = path.join(TEST_DIR, 'somefile3.json')
    var obj = {name: 'JP'}
    fs.writeFileSync(file, JSON.stringify(obj))

    try {
      var obj2 = jf.readFileSync(file)
      assert.equal(obj2.name, obj.name)
    } catch (err) {
      assert(err)
    }
  })

  describe('> when invalid JSON and throws set to false', function () {
    it('should return null', function () {
      var file = path.join(TEST_DIR, 'somefile4-invalid.json')
      var data = '{not valid JSON'
      fs.writeFileSync(file, data)

      assert.throws(function () {
        jf.readFileSync(file)
      })

      var obj = jf.readFileSync(file, {throws: false})
      assert.strictEqual(obj, null)
    })
  })

  describe('> when JSON reviver is set', function () {
    it('should transform the JSON', function () {
      var file = path.join(TEST_DIR, 'somefile.json')
      var sillyReviver = function (k, v) {
        if (typeof v !== 'string') return v
        if (v.indexOf('date:') < 0) return v
        return new Date(v.split('date:')[1])
      }

      var obj = {
        name: 'jp',
        day: 'date:2015-06-19T11:41:26.815Z'
      }

      fs.writeFileSync(file, JSON.stringify(obj))
      var data = jf.readFileSync(file, {reviver: sillyReviver})
      assert.strictEqual(data.name, 'jp')
      assert(data.day instanceof Date)
      assert.strictEqual(data.day.toISOString(), '2015-06-19T11:41:26.815Z')
    })
  })

  describe('> when passing encoding string as option', function () {
    it('should not throw an error', function () {
      var file = path.join(TEST_DIR, 'somefile.json')

      var obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))

      try {
        var data = jf.readFileSync(file, 'utf8')
      } catch (err) {
        assert.ifError(err)
      }
      assert.strictEqual(data.name, 'jp')
    })
  })
})
