var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ writeFile()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-writefile')
    rimraf(TEST_DIR, function () {
      fs.mkdir(TEST_DIR, done)
    })
  })

  afterEach(function (done) {
    rimraf(TEST_DIR, done)
  })

  it('should serialize and write JSON', function (done) {
    var file = path.join(TEST_DIR, 'somefile2.json')
    var obj = {name: 'JP'}

    jf.writeFile(file, obj, function (err) {
      assert.ifError(err)
      fs.readFile(file, 'utf8', function (err, data) {
        assert.ifError(err)
        var obj2 = JSON.parse(data)
        assert.equal(obj2.name, obj.name)

        // verify EOL
        assert.equal(data[data.length - 1], '\n')
        done()
      })
    })
  })

  describe('> when global spaces is set', function () {
    it('should write JSON with spacing', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = {name: 'JP'}
      jf.spaces = 2
      jf.writeFile(file, obj, function (err) {
        assert.ifError(err)

        var data = fs.readFileSync(file, 'utf8')
        assert.equal(data, '{\n  "name": "JP"\n}\n')

        // restore default
        jf.spaces = null
        done()
      })
    })
  })

  describe('> when JSON replacer is set', function () {
    it('should replace JSON', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return 'regex:' + v.toString()
      }

      var obj = {
        name: 'jp',
        reg: new RegExp(/hello/g)
      }

      jf.writeFile(file, obj, function (err) {
        assert.ifError(err)

        var data = JSON.parse(fs.readFileSync(file))
        assert.strictEqual(data.name, 'jp')
        assert.strictEqual(typeof data.reg, 'string')
        assert.strictEqual(data.reg, 'regex:/hello/g')
        done()
      }, {replacer: sillyReplacer})
    })
  })

  describe('> when passing null and callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, function (err) {
        assert.ifError(err)
        done()
      }, null)
    })
  })

  describe('> when spaces passed as an option', function () {
    it('should write file with spaces', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj, null, 8) + '\n')
        done()
      }, {spaces: 8})
    })
  })

  describe('> when passing encoding string as options', function () {
    it('should not error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj) + '\n')
        done()
      }, 'utf8')
    })
  })
})
