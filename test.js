var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('./')

describe('jsonfile', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests')
    rimraf(TEST_DIR, function () {
      fs.mkdir(TEST_DIR, done)
    })
  })

  afterEach(function (done) {
    rimraf(TEST_DIR, done)
  })

  describe('+ readFile()', function() {
    it('should read and parse JSON', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = {name: 'JP'}
      fs.writeFileSync(file, JSON.stringify(obj))

      jf.readFile(file, function(err, obj2) {
        assert.ifError(err)
        assert.equal(obj2.name, obj.name)
        done()
      })
    })
  })

  describe('+ writeFile()', function () {
    it('should serialize and write JSON', function (done) {
      var file = path.join(TEST_DIR, 'somefile2.json')
      var obj = {name: 'JP'}

      jf.writeFile(file, obj, function(err) {
        assert.ifError(err)
        fs.readFile(file, 'utf8', function(err,data) {
          assert.ifError(err)
          var obj2 = JSON.parse(data)
          assert.equal(obj2.name, obj.name)

          // verify EOL
          assert.equal(data[data.length-1], '\n')
          done()
        })
      })
    })
  })

  describe('+ readFileSync()', function() {
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
        var data = "{not valid JSON"
        fs.writeFileSync(file, data)

        assert.throws(function() {
          jf.readFileSync(file)
        })

        var obj = jf.readFileSync(file, {throws: false})
        assert.strictEqual(obj, null)
      })
    })
  })

  describe('+ writeFileSync()', function () {
    it('should serialize the JSON and write it to file', function () {
      var file = path.join(TEST_DIR, 'somefile4.json')
      var obj = {name: 'JP'}

      jf.writeFileSync(file, obj)

      var data = fs.readFileSync(file, 'utf8')
      var obj2 = JSON.parse(data)
      assert.equal(obj2.name, obj.name)
      assert.equal(data[data.length-1], '\n')
    })
  })
})
