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
    var obj = { name: 'JP' }

    jf.writeFile(file, obj, function (err) {
      assert.ifError(err)
      fs.readFile(file, 'utf8', function (err, data) {
        assert.ifError(err)
        var obj2 = JSON.parse(data)
        assert.strictEqual(obj2.name, obj.name)

        // verify EOL
        assert.strictEqual(data[data.length - 1], '\n')
        done()
      })
    })
  })

  it('should write JSON, resolve promise', function (done) {
    var file = path.join(TEST_DIR, 'somefile2.json')
    var obj = { name: 'JP' }

    jf.writeFile(file, obj)
      .then(res => {
        fs.readFile(file, 'utf8', function (err, data) {
          assert.ifError(err)
          var obj2 = JSON.parse(data)
          assert.strictEqual(obj2.name, obj.name)

          // verify EOL
          assert.strictEqual(data[data.length - 1], '\n')
          done()
        })
      })
      .catch(err => {
        assert.ifError(err)
        done()
      })
  })

  describe('> when JSON replacer is set', function () {
    var file, sillyReplacer, obj

    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')
      sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return 'regex:' + v.toString()
      }

      obj = {
        name: 'jp',
        reg: new RegExp(/hello/g)
      }

      done()
    })

    it('should replace JSON', function (done) {
      jf.writeFile(file, obj, { replacer: sillyReplacer }, function (err) {
        assert.ifError(err)

        var data = JSON.parse(fs.readFileSync(file))
        assert.strictEqual(data.name, 'jp')
        assert.strictEqual(typeof data.reg, 'string')
        assert.strictEqual(data.reg, 'regex:/hello/g')
        done()
      })
    })

    it('should replace JSON, resolve promise', function (done) {
      jf.writeFile(file, obj, { replacer: sillyReplacer })
        .then(res => {
          var data = JSON.parse(fs.readFileSync(file))
          assert.strictEqual(data.name, 'jp')
          assert.strictEqual(typeof data.reg, 'string')
          assert.strictEqual(data.reg, 'regex:/hello/g')
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when passing null as options and callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, null, function (err) {
        assert.ifError(err)
        done()
      })
    })
  })

  describe('> when passing null as options and No callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj = { name: 'jp' }
      jf.writeFile(file, obj, null)
        .then(res => {
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when spaces passed as an option', function () {
    var file, obj
    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')
      obj = { name: 'jp' }
      done()
    })

    it('should write file with spaces', function (done) {
      jf.writeFile(file, obj, { spaces: 8 }, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj, null, 8) + '\n')
        done()
      })
    })

    it('should write file with spaces, resolve the promise', function (done) {
      jf.writeFile(file, obj, { spaces: 8 })
        .then(res => {
          var data = fs.readFileSync(file, 'utf8')
          assert.strictEqual(data, JSON.stringify(obj, null, 8) + '\n')
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  describe('> when spaces, EOL are passed as options', function () {
    var file, obj
    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')
      obj = { name: 'jp' }
      done()
    })

    it('should use EOL override', function (done) {
      jf.writeFile(file, obj, { spaces: 2, EOL: '***' }, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, '{***  "name": "jp"***}***')
        done()
      })
    })

    it('should use EOL override, resolve the promise', function (done) {
      jf.writeFile(file, obj, { spaces: 2, EOL: '***' })
        .then(res => {
          var data = fs.readFileSync(file, 'utf8')
          assert.strictEqual(data, '{***  "name": "jp"***}***')
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })
  describe('> when passing encoding string as options', function () {
    var file, obj
    beforeEach(function (done) {
      file = path.join(TEST_DIR, 'somefile.json')
      obj = { name: 'jp' }
      done()
    })

    it('should not error', function (done) {
      jf.writeFile(file, obj, 'utf8', function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, JSON.stringify(obj) + '\n')
        done()
      })
    })

    it('should not error, resolve the promise', function (done) {
      jf.writeFile(file, obj, 'utf8')
        .then(res => {
          var data = fs.readFileSync(file, 'utf8')
          assert.strictEqual(data, JSON.stringify(obj) + '\n')
          done()
        })
        .catch(err => {
          assert.ifError(err)
          done()
        })
    })
  })

  // Prevent https://github.com/jprichardson/node-jsonfile/issues/81 from happening
  describe("> when callback isn't passed & can't serialize", function () {
    it('should not write an empty file, should reject the promise', function (done) {
      this.slow(1100)
      var file = path.join(TEST_DIR, 'somefile.json')
      var obj1 = { name: 'JP' }
      var obj2 = { person: obj1 }
      obj1.circular = obj2

      jf.writeFile(file, obj1)
        .catch(err => {
          assert(err)
          assert(!fs.existsSync(file))
          done()
        })
    })
  })
})
