var assert = require('assert')
var fs = require('fs')
var mockfs = require('mock-fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ readFile()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-readfile')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(function (done) {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('should read and parse JSON', function (done) {
    var file = path.join(TEST_DIR, 'somefile.json')
    var obj = {name: 'JP'}
    fs.writeFileSync(file, JSON.stringify(obj))

    jf.readFile(file, function (err, obj2) {
      assert.ifError(err)
      assert.equal(obj2.name, obj.name)
      done()
    })
  })

  describe('> when invalid JSON', function () {
    it('should include the filename in the error', function (done) {
      var fn = 'somefile.json'
      var file = path.join(TEST_DIR, fn)
      fs.writeFileSync(file, '{')

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        done()
      })
    })
  })

  describe('> when invalid JSON and throws set to false', function () {
    it('should return null and no error', function (done) {
      var fn = 'somefile4-invalid.json'
      var file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      var bothDone = false
      fs.writeFileSync(file, data)

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, {throws: false}, function (err, obj2) {
        assert.ifError(err)
        assert.strictEqual(obj2, null)
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })
  })

  describe('> when invalid JSON and throws set to false', function () {
    it('should return null and no error', function (done) {
      var fn = 'somefile4-invalid.json'
      var file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      var bothDone = false
      fs.writeFileSync(file, data)

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, {throws: false}, function (err, obj2) {
        assert.ifError(err)
        assert.strictEqual(obj2, null)
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })
  })

  describe('> when invalid JSON and throws set to true', function () {
    it('should return an error', function (done) {
      var fn = 'somefile4-invalid.json'
      var file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      var bothDone = false
      fs.writeFileSync(file, data)

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, {throws: true}, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })
  })

  describe('> when invalid JSON and throws set to true', function () {
    it('should return an error', function (done) {
      var fn = 'somefile4-invalid.json'
      var file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      var bothDone = false
      fs.writeFileSync(file, data)

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, {throws: true}, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })
  })

  describe('> when JSON reviver is set', function () {
    it('should transform the JSON', function (done) {
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
      jf.readFile(file, {reviver: sillyReviver}, function (err, data) {
        assert.ifError(err)
        assert.strictEqual(data.name, 'jp')
        assert(data.day instanceof Date)
        assert.strictEqual(data.day.toISOString(), '2015-06-19T11:41:26.815Z')
        done()
      })
    })
  })

  describe('> when passing null and callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')

      var obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))

      jf.readFile(file, null, function (err) {
        assert.ifError(err)
        assert.strictEqual(obj.name, 'jp')
        done()
      })
    })
  })

  describe('> when passing encoding string as option', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')

      var obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))

      jf.readFile(file, 'utf8', function (err) {
        assert.ifError(err)
        assert.strictEqual(obj.name, 'jp')
        done()
      })
    })
  })

  describe('mockfs', function () {
    it('should read from a mockfs', function (done) {
      var mfs = mockfs.fs()
      var dataOut = {name: 'JP'}
      mfs.writeFileSync('test.json', JSON.stringify(dataOut), 'utf8')
      jf.readFile('test.json', { fs: mfs }, function (err, dataIn) {
        assert.ifError(err)
        assert.deepEqual(dataOut, dataIn)
        done()
      })
    })
  })

  describe('> w/ BOM', function () {
    it('should properly parse', function (done) {
      var file = path.join(TEST_DIR, 'file-bom.json')
      var obj = { name: 'JP' }
      fs.writeFileSync(file, '\uFEFF' + JSON.stringify(obj))
      jf.readFile(file, function (err, data) {
        assert.ifError(err)
        assert.deepEqual(obj, data)
        done()
      })
    })
  })
})
