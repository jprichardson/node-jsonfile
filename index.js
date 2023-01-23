let fs
const universalify = require('universalify')

try {
  fs = require('graceful-fs')
} catch (_) {
  fs = require('fs')
}

const { stringify, stripBom } = require('./utils.js')

async function readFile (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }
  const _fs = options.fs || fs
  const shouldThrow = options.throws ?? true

  try {
    const content = await _fs.promises.readFile(file, options)
    return JSON.parse(stripBom(content), options ? options.reviver : null)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

function readFileSync (file, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }
  const _fs = options.fs || fs
  const shouldThrow = options.throws ?? true

  try {
    const content = _fs.readFileSync(file, options)
    return JSON.parse(stripBom(content), options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

async function writeFile (file, obj, options = {}) {
  const str = stringify(obj, options)
  const _fs = options.fs || fs
  await _fs.promises.writeFile(file, str, options)
}

function writeFileSync (file, obj, options = {}) {
  const str = stringify(obj, options)
  const _fs = options.fs || fs
  _fs.writeFileSync(file, str, options)
}

const jsonfile = {
  readFile: universalify.fromPromise(readFile),
  readFileSync,
  writeFile: universalify.fromPromise(writeFile),
  writeFileSync
}

module.exports = jsonfile
