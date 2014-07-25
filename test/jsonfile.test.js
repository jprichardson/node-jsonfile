var testutil = require('testutil')
var jf = require('../')
var fs = require('fs')
var path = require('path')

var TEST_DIR = ''

beforeEach(function() {
  TEST_DIR = testutil.createTestDir('jsonfile')
})

suite('jsonfile')

test('- readFile()', function(done) {
  var file = path.join(TEST_DIR, 'somefile.json')
  var obj = {name: 'JP'}
  fs.writeFileSync(file, JSON.stringify(obj))

  jf.readFile(file, function(err, obj2) {
    F (err)
    T (obj2.name === obj.name)
    done()
  })
})

test('- writeFile()', function(done) {
  var file = path.join(TEST_DIR, 'somefile2.json')
  var obj = {name: 'JP'}

  jf.writeFile(file, obj, function(err) {
    F (err)
    fs.readFile(file, 'utf8', function(err,data) {
      var obj2 = JSON.parse(data)
      T (obj2.name === obj.name)
      done()
    })
  })
})

test('- writeFile() adds EOL at EOF', function(done) {
  var file = path.join(TEST_DIR, 'eol.json')
  var obj = {name: 'JP'}

  jf.writeFile(file, obj, function(err) {
    F (err)
    fs.readFile(file, 'utf8', function(err,data) {
      T (data[data.length-1] === '\n')
      done()
    })
  })
})

test('- readFileSync()', function(done) {
  var file = path.join(TEST_DIR, 'somefile3.json')
  var obj = {name: 'JP'}
  fs.writeFileSync(file, JSON.stringify(obj))

  try {
    var obj2 = jf.readFileSync(file)
    T (obj2.name === obj.name)
    done()
  } catch (err) {
    done(err)
  }
})

test('- writeFileSync()', function(done) {
  var file = path.join(TEST_DIR, 'somefile4.json')
  var obj = {name: 'JP'}

  jf.writeFileSync(file, obj)

  var obj2 = JSON.parse(fs.readFileSync(file, 'utf8'))
  T (obj2.name === obj.name)
  done()
})

test('- writeFileSync() adds EOL at EOF', function(done) {
  var file = path.join(TEST_DIR, 'eol-sync.json')
  var obj = {name: 'JP'}

  jf.writeFileSync(file, obj)

  var data = fs.readFileSync(file, 'utf8')
  T (data[data.length-1] === '\n')
  done()
})
