var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ appendFileSync()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-appendfile-sync')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(function (done) {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('should serialize the JSON and append it to file', function () {
    var file = path.join(TEST_DIR, 'someexistedfile.json')
    var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
    fs.writeFileSync(file, JSON.stringify(obj))
    var dataToAppend = {email: 'updemail@some.com', msgs: [{id: 2, rec: 'someOtherRec'}], colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
    var afterAppend = '{"name":"jp","email":"updemail@some.com","msgs":[{"id":0,"rec":"somerec"},{"id":1,"rec":"otherrec"},{"id":2,"rec":"someOtherRec"}],"colors":["gray","blue","magenta","red"],"math":"fun","animals":["octopus","monkey"]}\n'

    jf.appendFileSync(file, dataToAppend)

    var data = fs.readFileSync(file, 'utf8')
    var obj2 = JSON.parse(data)
    assert.equal(data[data.length - 1], '\n')
    assert.equal(obj2.name, obj.name)
    assert.equal(obj2.email, 'updemail@some.com')
    assert.equal(obj2.colors.length, 4)
    assert.deepStrictEqual(data, afterAppend)
  })

  describe('> when global spaces is set', function () {
    it('should append JSON with spacing', function () {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{\n  "name": "jp",\n  "email": "updemail@some.com",\n  "msgs": [\n    {\n      "id": 0,\n      "rec": "somerec"\n    },\n    {\n      "id": 1,\n      "rec": "otherrec"\n    }\n  ],\n  "colors": [\n    "gray",\n    "blue",\n    "magenta",\n    "red"\n  ],\n  "math": "fun",\n  "animals": [\n    "octopus",\n    "monkey"\n  ]\n}\n'
      jf.spaces = 2
      jf.appendFileSync(file, dataToAppend)

      var data = fs.readFileSync(file, 'utf8')
      assert.deepStrictEqual(data, afterAppend)
      jf.spaces = null
    })
  })

  describe('> when JSON replacer is set', function () {
    it('should replace JSON', function () {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))
      var sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return 'regex:' + v.toString()
      }
      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey'], reg: new RegExp(/hello/g)}

      jf.appendFileSync(file, dataToAppend, {replacer: sillyReplacer})
      var data = JSON.parse(fs.readFileSync(file))
      assert.strictEqual(data.name, 'jp')
      assert.strictEqual(data.email, 'updemail@some.com')
      assert.strictEqual(data.math, 'fun')
      assert.strictEqual(data.colors.length, 4)
      assert.strictEqual(data.animals.length, 2)
      assert.strictEqual(typeof data.reg, 'string')
      assert.strictEqual(data.reg, 'regex:/hello/g')
    })
  })

  describe('> when spaces passed as an option', function () {
    it('should append file with spaces', function () {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{\n        "name": "jp",\n        "email": "updemail@some.com",\n        "msgs": [\n                {\n                        "id": 0,\n                        "rec": "somerec"\n                },\n                {\n                        "id": 1,\n                        "rec": "otherrec"\n                }\n        ],\n        "colors": [\n                "gray",\n                "blue",\n                "magenta",\n                "red"\n        ],\n        "math": "fun",\n        "animals": [\n                "octopus",\n                "monkey"\n        ]\n}\n'

      jf.appendFileSync(file, dataToAppend, {spaces: 8})
      var data = fs.readFileSync(file, 'utf8')
      assert.deepStrictEqual(data, afterAppend)
      jf.spaces = null
    })
  })

  describe('> when passing encoding string as options', function () {
    it('should not error', function () {
      var file = path.join(TEST_DIR, 'someexistedfile.json')
      var obj = {name: 'jp', email: 'rand@some.com', msgs: [{id: 0, rec: 'somerec'}, {id: 1, rec: 'otherrec'}], colors: ['gray', 'blue', 'magenta']}
      fs.writeFileSync(file, JSON.stringify(obj))

      var dataToAppend = {email: 'updemail@some.com', msgs: {id: 2, rec: 'someOtherRec'}, colors: ['red'], math: 'fun', animals: ['octopus', 'monkey']}
      var afterAppend = '{"name":"jp","email":"updemail@some.com","msgs":[{"id":0,"rec":"somerec"},{"id":1,"rec":"otherrec"}],"colors":["gray","blue","magenta","red"],"math":"fun","animals":["octopus","monkey"]}\n'

      jf.appendFileSync(file, dataToAppend, 'utf8')
      var data = fs.readFileSync(file, 'utf8')
      assert.deepStrictEqual(data, afterAppend)
    })
  })
})
