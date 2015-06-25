var fs = require('fs')

function readFile (file, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }

  fs.readFile(file, options, function (err, data) {
    if (err) return callback(err)

    var obj
    try {
      obj = JSON.parse(data, options ? options.reviver : null)
    } catch (err2) {
      return callback(err2)
    }

    callback(null, obj)
  })
}

function readFileSync (file, options) {
  options = options || {}
  if (typeof options === 'string') {
    options = {encoding: options}
  }

  var shouldThrow = 'throws' in options ? options.throw : true

  if (shouldThrow) { // i.e. throw on invalid JSON
    return JSON.parse(fs.readFileSync(file, options), options.reviver)
  } else {
    try {
      return JSON.parse(fs.readFileSync(file, options), options.reviver)
    } catch (err) {
      return null
    }
  }
}

function writeFile (file, obj, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }

  var str = ''
  try {
    str = JSON.stringify(obj, options ? options.replacer : null, this.spaces) + '\n'
  } catch (err) {
    if (callback) return callback(err, null)
  }

  fs.writeFile(file, str, options, callback)
}

function writeFileSync (file, obj, options) {
  options = options || {}
  var str = JSON.stringify(obj, options.replacer, this.spaces) + '\n'
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function appendFile (file, obj, options, callback) {
  if (callback == null) {
    callback = options
    options = null
  }

  var str = ''
  try {
    str = JSON.stringify(obj, null, this.spaces) + '\n'
  } catch (err) {
    if (callback) return callback(err, null)
  }

  fs.appendFile(file, str, options, callback)
}

function appendFileSync (file, obj, options) {
  var str = JSON.stringify(obj, null, this.spaces) + '\n'
  return fs.appendFileSync(file, str, options)
}

var jsonfile = {
  spaces: null,
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync,
  appendFile: appendFile,
  appendFileSync: appendFileSync
}

module.exports = jsonfile
