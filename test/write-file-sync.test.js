var assert = require('assert')
var fs = require('fs')
var mockfs = require('mock-fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ writeFileSync()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-writefile-sync')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(function (done) {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('should serialize the JSON and write it to file', function () {
    var file = path.join(TEST_DIR, 'somefile4.json')
    var obj = {name: 'JP'}

    jf.writeFileSync(file, obj)

    var data = fs.readFileSync(file, 'utf8')
    var obj2 = JSON.parse(data)
    assert.equal(obj2.name, obj.name)
    assert.equal(data[data.length - 1], '\n')
    assert.equal(data, '{"name":"JP"}\n')
  })

  describe('> when global spaces is set', function () {
    it('should write JSON with spacing', function () {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = {name: 'JP'}
      jf.spaces = 2
      jf.writeFileSync(file, obj)

      var data = fs.readFileSync(file, 'utf8')
      assert.equal(data, '{\n  "name": "JP"\n}\n')

      // restore default
      jf.spaces = null
    })
  })

  describe('> when JSON replacer is set', function () {
    it('should replace JSON', function () {
      var file = path.join(TEST_DIR, 'somefile.json')
      var sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return 'regex:' + v.toString()
      }

      var obj = {
        name: 'jp',
        reg: new RegExp(/hello/g)
      }

      jf.writeFileSync(file, obj, {replacer: sillyReplacer})
      var data = JSON.parse(fs.readFileSync(file))
      assert.strictEqual(data.name, 'jp')
      assert.strictEqual(typeof data.reg, 'string')
      assert.strictEqual(data.reg, 'regex:/hello/g')
    })
  })

  describe('> when spaces passed as an option', function () {
    it('should write file with spaces', function () {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'JP' }
      jf.writeFileSync(file, obj, {spaces: 8})
      var data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, JSON.stringify(obj, null, 8) + '\n')
    })
  })

  describe('> when passing encoding string as options', function () {
    it('should not error', function () {
      var file = path.join(TEST_DIR, 'somefile6.json')
      var obj = { name: 'jp' }
      jf.writeFileSync(file, obj, 'utf8')
      var data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, JSON.stringify(obj) + '\n')
    })
  })

  describe('mockfs', function () {
    it('should write to mockfs', function () {
      var mfs = mockfs.fs()
      var dataOut = { name: 'JP' }
      var file = 'somefile.json'
      jf.writeFileSync(file, dataOut, { fs: mfs })
      var dataIn = JSON.parse(mfs.readFileSync(file, 'utf8'))
      assert.deepEqual(dataOut, dataIn)
    })
  })
})
