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
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(function (done) {
    rimraf.sync(TEST_DIR)
    done()
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

      jf.writeFile(file, obj, {replacer: sillyReplacer}, function (err) {
        assert.ifError(err)

        var data = JSON.parse(fs.readFileSync(file))
        assert.strictEqual(data.name, 'jp')
        assert.strictEqual(typeof data.reg, 'string')
        assert.strictEqual(data.reg, 'regex:/hello/g')
        done()
      })
    })
  })

  describe('> when passing null and callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, null, function (err) {
        assert.ifError(err)
        done()
      })
    })
  })

  describe('> when spaces passed as an option', function () {
    it('should write file with spaces', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, {spaces: 8}, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj, null, 8) + '\n')
        done()
      })
    })
  })

  describe('> when passing encoding string as options', function () {
    it('should not error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, 'utf8', function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj) + '\n')
        done()
      })
    })
  })

  // Prevent https://github.com/jprichardson/node-jsonfile/issues/81 from happening
  describe("> when callback isn't passed & can't serialize", function () {
    it('should not write an empty file', function (done) {
      this.slow(1100)
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj1 = { name: 'JP' }
      var obj2 = { person: obj1 }
      obj1.circular = obj2

      jf.writeFile(file, obj1)

      setTimeout(function () {
        assert(!fs.existsSync(file))
        done()
      }, 1000)
    })
  })
})
