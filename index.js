const universalify = require('universalify')
let _fs
try {
  _fs = require('graceful-fs')
} catch (_) {
  _fs = require('fs')
}

function stripBom (content) {
  if (Buffer.isBuffer(content)) {
    content = content.toString('utf8')
  }
  return content.replace(/^\uFEFF/, '')
}

function doThrowForFile (file, options, error, callback) {
  error.message = file + ': ' + error.message
  return options['throws'] !== false ? callback(error) : callback(null, null)
}

function throwErrorCallback (err, data) {
  if (err) throw err
  return data
}

function getOptions (options) {
  return typeof options === 'string' ? { encoding: options } : options || {}
}

function handleCallbackAndOptions (options, callback) {
  return callback != null ? [options, callback] : [{}, options]
}

function parseJson (file, data, options, callback) {
  try {
    const parsed = JSON.parse(stripBom(data), options['reviver'])
    return callback(null, parsed)
  } catch (jsonError) {
    return doThrowForFile(file, options, jsonError, callback)
  }
}

function stringify (obj, options) {
  const opts = (options && typeof options === 'object') ? options : {}
  const str = JSON.stringify(obj, opts['replacer'], opts['spaces'])
  const EOL = opts['EOL'] || '\n'
  return str.replace(/\n/g, EOL) + EOL
}

function readFile (file, options, callback) {
  [options, callback] = handleCallbackAndOptions(options, callback)
  options = getOptions(options)
  const fs = options.fs || _fs
  fs.readFile(file, options, (err, data) => {
    return err ? callback(err) : parseJson(file, data, options, callback)
  })
}

function readFileSync (file, options) {
  options = getOptions(options)
  const fs = options.fs || _fs
  try {
    const data = fs.readFileSync(file, options)
    return parseJson(file, data, options, throwErrorCallback)
  } catch (fileError) {
    return doThrowForFile(file, options, fileError, throwErrorCallback)
  }
}

function writeFile (file, obj, options, callback) {
  [options, callback] = handleCallbackAndOptions(options || {}, callback)
  const fs = options.fs || _fs
  try {
    const str = stringify(obj, options)
    fs.writeFile(file, str, options, callback)
  } catch (err) {
    return callback(err, null)
  }
}

function writeFileSync (file, obj, options) {
  options = options || {}
  const fs = options.fs || _fs
  const str = stringify(obj, options)
  return fs.writeFileSync(file, str, options)
}

module.exports = {
  readFile: universalify.fromCallback(readFile),
  readFileSync: readFileSync,
  writeFile: universalify.fromCallback(writeFile),
  writeFileSync: writeFileSync
}
