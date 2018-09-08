var assert = require('assert')
var fs = require('fs')
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
    var obj = { name: 'JP' }
    fs.writeFileSync(file, JSON.stringify(obj))

    jf.readFile(file, function (err, obj2) {
      assert.ifError(err)
      assert.strictEqual(obj2.name, obj.name)
      done()
    })
  })

  it('should resolve a promise with parsed JSON', function (done) {
    var file = path.join(TEST_DIR, 'somefile.json')
    var obj = { name: 'JP' }
    fs.writeFileSync(file, JSON.stringify(obj))

    jf.readFile(file)
      .then((data) => {
        assert.strictEqual(data.name, obj.name)
        done()
      })
      .catch(err => {
        assert.ifError(err)
        done()
      })
  })

  describe('> when invalid JSON', function () {
    var fn, file

    beforeEach(function (done) {
      fn = 'somefile.json'
      file = path.join(TEST_DIR, fn)
      fs.writeFileSync(file, '{')
      done()
    })

    it('should include the filename in the error', function (done) {
      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        done()
      })
    })

    it('should reject the promise with filename in error', function (done) {
      jf.readFile(file)
        .catch(err => {
          assert(err instanceof Error)
          assert(err.message.match(fn))
          done()
        })
    })
  })

  describe('> when invalid JSON and throws set to false', function () {
    var fn, file

    beforeEach(function (done) {
      fn = 'somefile4-invalid.json'
      file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      fs.writeFileSync(file, data)
      done()
    })

    it('should return null and no error', function (done) {
      var bothDone = false

      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, { throws: false }, function (err, obj2) {
        assert.ifError(err)
        assert.strictEqual(obj2, null)
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })

    it('should resolve the promise with null as data', function (done) {
      jf.readFile(file, { throws: false })
        .then(data => {
          assert.strictEqual(data, null)
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when invalid JSON and throws set to true', function () {
    var fn, file

    beforeEach(function (done) {
      fn = 'somefile4-invalid.json'
      file = path.join(TEST_DIR, fn)
      var data = '{not valid JSON'
      fs.writeFileSync(file, data)
      done()
    })

    it('should return an error', function (done) {
      var bothDone = false
      jf.readFile(file, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })

      jf.readFile(file, { throws: true }, function (err, obj2) {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        if (bothDone) {
          done()
        }
        bothDone = true
      })
    })

    it('should reject the promise', function (done) {
      jf.readFile(file, { throws: true })
        .catch(err => {
          assert(err instanceof Error)
          assert(err.message.match(fn))
          done()
        })
    })
  })

  describe('> when JSON reviver is set', function () {
    var file, sillyReviver

    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')
      sillyReviver = function (k, v) {
        if (typeof v !== 'string') return v
        if (v.indexOf('date:') < 0) return v
        return new Date(v.split('date:')[1])
      }

      var obj = { name: 'jp', day: 'date:2015-06-19T11:41:26.815Z' }

      fs.writeFileSync(file, JSON.stringify(obj))
      done()
    })

    it('should transform the JSON', function (done) {
      jf.readFile(file, { reviver: sillyReviver }, function (err, data) {
        assert.ifError(err)
        assert.strictEqual(data.name, 'jp')
        assert(data.day instanceof Date)
        assert.strictEqual(data.day.toISOString(), '2015-06-19T11:41:26.815Z')
        done()
      })
    })

    it('should resolve the promise with transformed JSON', function (done) {
      jf.readFile(file, { reviver: sillyReviver })
        .then(data => {
          assert.strictEqual(data.name, 'jp')
          assert(data.day instanceof Date)
          assert.strictEqual(data.day.toISOString(), '2015-06-19T11:41:26.815Z')
          done()
        }).catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when passing null as options and callback', function () {
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

  describe('> when passing null as options and expecting a promise', function () {
    it('should resolve the promise', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')

      var obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))

      jf.readFile(file, null)
        .then(data => {
          assert.strictEqual(data.name, obj.name)
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when passing encoding string as option', function () {
    var file, obj

    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')

      obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))
      done()
    })

    it('should not throw an error', function (done) {
      jf.readFile(file, 'utf8', function (err) {
        assert.ifError(err)
        assert.strictEqual(obj.name, 'jp')
        done()
      })
    })

    it('should resolve the promise', function (done) {
      jf.readFile(file, 'utf8')
        .then(data => {
          assert.strictEqual(data.name, obj.name)
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> w/ BOM', function () {
    var file, obj

    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'file-bom.json')
      obj = { name: 'JP' }
      fs.writeFileSync(file, '\uFEFF' + JSON.stringify(obj))
      done()
    })

    it('should properly parse', function (done) {
      jf.readFile(file, function (err, data) {
        assert.ifError(err)
        assert.deepStrictEqual(obj, data)
        done()
      })
    })

    it('should resolve the promise with parsed JSON', function (done) {
      jf.readFile(file)
        .then(data => {
          assert.deepStrictEqual(data, obj)
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })
})
