function stringify (obj, options = {}) {
  const EOL = options.EOL || '\n'
  // by default if finalEOL is not present in options, it should be considered as true
  const EOF = (options.hasOwnProperty('finalEOL') && !options.finalEOL) ? '' : EOL

  const str = JSON.stringify(obj, options ? options.replacer : null, options.spaces)

  return str.replace(/\n/g, EOL) + EOF
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8')
  return content.replace(/^\uFEFF/, '')
}

module.exports = { stringify, stripBom }
