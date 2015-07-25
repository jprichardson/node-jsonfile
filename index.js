var fs = require('fs')

function readFile (file, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }

  var self = this
  fs.readFile(file, options, function (err, data) {
    if (err) return callback(err)

    var obj
    try {
      obj = JSON.parse(self.decodeStr(data), options ? options.reviver : null)
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
    return JSON.parse(this.decodeStr(fs.readFileSync(file, options)), options.reviver)
  } else {
    try {
      return JSON.parse(this.decodeStr(fs.readFileSync(file, options)), options.reviver)
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

  var spaces = typeof options === 'object' && options !== null
    ? 'spaces' in options
    ? options.spaces : this.spaces
    : this.spaces

  var str = ''
  try {
    str = JSON.stringify(obj, options ? options.replacer : null, spaces) + '\n'
  } catch (err) {
    if (callback) return callback(err, null)
  }

  fs.writeFile(file, str, options, callback)
}

function writeFileSync (file, obj, options) {
  options = options || {}

  var spaces = typeof options === 'object' && options !== null
    ? 'spaces' in options
    ? options.spaces : this.spaces
    : this.spaces

  var str = JSON.stringify(obj, options.replacer, spaces) + '\n'
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function decodeStr (str) {
  if (typeof str === 'string') {
    return unescape(str.replace(/\\u([\dA-F]{4})/gi, function (match, charCode) {
      return String.fromCharCode(parseInt(charCode, 16))
    }))
  }
  return str
}

var jsonfile = {
  spaces: null,
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync,
  decodeStr: decodeStr
}

module.exports = jsonfile
