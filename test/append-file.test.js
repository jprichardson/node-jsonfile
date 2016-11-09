var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ appendFile()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-appendfile')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(function (done) {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('should serialize and append JSON', function (done) {
    var file = path.join(TEST_DIR, 'someexistedfile.json')
    var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
    fs.writeFileSync(file, JSON.stringify(obj))

    var dataToAppend = {email: 'updemail@some.com', msgs: [{id: 2, rec: 'someOtherRec'}], colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
    var afterAppend = '{"name":"jp","email":"updemail@some.com","msgs":[{"id":0,"rec":"somerec"},{"id":1,"rec":"otherrec"},{"id":2,"rec":"someOtherRec"}],"colors":["gray","blue","magenta","red"],"math":"fun","animals":["octopus","monkey"]}\n'

    jf.appendFile(file, dataToAppend, function (err) {
      assert.ifError(err)
      fs.readFile(file, 'utf8', function (err, data) {
        assert.ifError(err)
        var obj2 = JSON.parse(data)
        assert.equal(obj2.name, obj.name)
        assert.equal(obj2.email, 'updemail@some.com')
        assert.equal(obj2.colors.length, 4)
        assert.strictEqual(data, afterAppend)
        assert.equal(data[data.length - 1], '\n')
        done()
      })
    })
  })

  describe('> when global spaces is set', function () {
    it('should append JSON with spacing', function (done) {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{\n  "name": "jp",\n  "email": "updemail@some.com",\n  "msgs": [\n    {\n      "id": 0,\n      "rec": "somerec"\n    },\n    {\n      "id": 1,\n      "rec": "otherrec"\n    }\n  ],\n  "colors": [\n    "gray",\n    "blue",\n    "magenta",\n    "red"\n  ],\n  "math": "fun",\n  "animals": [\n    "octopus",\n    "monkey"\n  ]\n}\n'

      jf.spaces = 2
      jf.appendFile(file, dataToAppend, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, afterAppend)
        jf.spaces = null
        done()
      })
    })
  })

  describe('> when JSON replacer is set', function () {
    it('should replace JSON', function (done) {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))
      var sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return 'regex:' + v.toString()
      }

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey'], reg: new RegExp(/hello/g)}

      jf.appendFile(file, dataToAppend, {replacer: sillyReplacer}, function (err) {
        assert.ifError(err)
        var data = JSON.parse(fs.readFileSync(file))
        assert.strictEqual(data.name, 'jp')
        assert.strictEqual(data.email, 'updemail@some.com')
        assert.strictEqual(data.math, 'fun')
        assert.strictEqual(data.colors.length, 4)
        assert.strictEqual(data.animals.length, 2)
        assert.strictEqual(typeof data.reg, 'string')
        assert.strictEqual(data.reg, 'regex:/hello/g')
        done()
      })
    })
  })

  describe('> when passing null and callback', function () {
    it('should not throw an error', function (done) {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: [{id: 2, rec: 'someOtherRec'}], colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{"name":"jp","email":"updemail@some.com","msgs":[{"id":0,"rec":"somerec"},{"id":1,"rec":"otherrec"},{"id":2,"rec":"someOtherRec"}],"colors":["gray","blue","magenta","red"],"math":"fun","animals":["octopus","monkey"]}\n'

      jf.appendFile(file, dataToAppend, null, function (err) {
        assert.ifError(err)
        fs.readFile(file, 'utf8', function (err, data) {
          assert.ifError(err)
          assert.strictEqual(data, afterAppend)
          done()
        })
      })
    })
  })

  describe('> when spaces passed as an option', function () {
    it('should append file with spaces', function (done) {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{\n        "name": "jp",\n        "email": "updemail@some.com",\n        "msgs": [\n                {\n                        "id": 0,\n                        "rec": "somerec"\n                },\n                {\n                        "id": 1,\n                        "rec": "otherrec"\n                }\n        ],\n        "colors": [\n                "gray",\n                "blue",\n                "magenta",\n                "red"\n        ],\n        "math": "fun",\n        "animals": [\n                "octopus",\n                "monkey"\n        ]\n}\n'
      jf.appendFile(file, dataToAppend, {spaces: 8}, function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, afterAppend)
        done()
      })
    })
  })

  describe('> when passing encoding string as options', function () {
    it('should not error', function (done) {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{"name":"jp","email":"updemail@some.com","msgs":[{"id":0,"rec":"somerec"},{"id":1,"rec":"otherrec"}],"colors":["gray","blue","magenta","red"],"math":"fun","animals":["octopus","monkey"]}\n'

      jf.appendFile(file, dataToAppend, 'utf8', function (err) {
        assert.ifError(err)
        var data = fs.readFileSync(file, 'utf8')
        assert.strictEqual(data, afterAppend)
        done()
      })
    })
  })
})
