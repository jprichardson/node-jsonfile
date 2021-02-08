let _fs
try {
  _fs = require('graceful-fs')
} catch (_) {
  _fs = require('fs')
}
const universalify = require('universalify')
const { stringify, stripBom } = require('./utils')

async function _readFile (file, options = {}, callback = undefined) {
  if (typeof file !== 'string') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "file" argument must be of type string')
  }

  // if the options argument is a function and there is no callback argument
  // then the options argument specifies the callback
  if (typeof options === 'function' && !callback) {
    callback = options
    options = {}
  }

  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  let data = await universalify.fromCallback(fs.readFile)(file, options)

  data = stripBom(data)

  let obj
  try {
    obj = JSON.parse(data, options ? options.reviver : null)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }

  return obj
}

async function readFile (file, options = {}, callback = undefined) {
  const readFileRet = _readFile(file, options, callback)

  if (typeof options === 'function' && !callback) {
    callback = options
    options = {}
  }

  if (callback) {
    readFileRet.then(r => callback(null, r), callback) // this is the fromPromise behaviour
  } else {
    return readFileRet
  }
}

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const fs = options.fs || _fs

  const shouldThrow = 'throws' in options ? options.throws : true

  try {
    let content = fs.readFileSync(file, options)
    content = stripBom(content)
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

async function writeFile (file, obj, options = {}, callback = undefined) {
  if (typeof file !== 'string') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "file" argument must be of type string')
  }
  if (typeof obj !== 'object') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "obj" argument must be of type object')
  }

  // if the options argument is a function and there is no callback argument
  // then the options argument specifies the callback
  if (typeof options === 'function' && !callback) {
    callback = options
    options = {}
  }

  const fs = options.fs || _fs

  const str = stringify(obj, options)

  const res = universalify.fromCallback(fs.writeFile)(file, str, options)
  if (callback) {
    res.then(r => callback(null, r), callback) // this is the fromPromise behaviour
  }
  await res
}

function writeFileSync (file, obj, options = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

const jsonfile = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}

module.exports = jsonfile
