var _fs
try {
  _fs = require('graceful-fs')
} catch (_) {
  _fs = require('fs')
}

var writeFilePromisified = function (fs, file, str, options) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(file, str, options, function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

function readFile (file, options, callback) {
  if (callback == null && typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof options === 'string') {
    options = {encoding: options}
  }

  options = options || {}
  var fs = options.fs || _fs

  var shouldThrow = true
  if ('throws' in options) {
    shouldThrow = options.throws
  }

  var ps = new Promise(function (resolve, reject) {
    fs.readFile(file, options, function (err, data) {
      if (err) return callback ? callback(err) : reject(err)

      data = stripBom(data)

      var obj
      try {
        obj = JSON.parse(data, options ? options.reviver : null)
      } catch (err2) {
        if (shouldThrow) {
          err2.message = file + ': ' + err2.message
          return callback ? callback(err2) : reject(err2)
        } else {
          return callback ? callback(null, null) : resolve()
        }
      }

      return callback ? callback(null, obj) : resolve(obj)
    })
  })

  if (callback) ps.then()
  else return ps
}

function readFileSync (file, options) {
  options = options || {}
  if (typeof options === 'string') {
    options = {encoding: options}
  }

  var fs = options.fs || _fs

  var shouldThrow = true
  if ('throws' in options) {
    shouldThrow = options.throws
  }

  try {
    var content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = file + ': ' + err.message
      throw err
    } else {
      return null
    }
  }
}

function stringify (obj, options) {
  var spaces
  var EOL = '\n'
  if (typeof options === 'object' && options !== null) {
    if (options.spaces) {
      spaces = options.spaces
    }
    if (options.EOL) {
      EOL = options.EOL
    }
  }

  var str = JSON.stringify(obj, options ? options.replacer : null, spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function writeFile (file, obj, options, callback) {
  if (callback == null && typeof options === 'function') {
    callback = options
    options = {}
  }
  options = options || {}
  var fs = options.fs || _fs

  var str = ''
  try {
    str = stringify(obj, options)
  } catch (err) {
    return callback ? callback(err, null) : Promise.reject(err)
  }

  if (callback) fs.writeFile(file, str, options, callback)
  else return writeFilePromisified(fs, file, str, options)
}

function writeFileSync (file, obj, options) {
  options = options || {}
  var fs = options.fs || _fs

  var str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8')
  content = content.replace(/^\uFEFF/, '')
  return content
}

var jsonfile = {
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync
}

module.exports = jsonfile
