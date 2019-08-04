import * as fs from 'fs'
let _fs: fs

try {
   _fs = require('graceful-fs')
} catch (_) {
  _fs = fs
}

import * as universalify from 'universalify'
import { Result, Success } from "amonad"

type fs = typeof fs

type Options = {
  encoding?: string | null;
  flag?: string;
  fs?: fs
  throws?: boolean,
  reviver?: (this: any, key: string, value: any) => any
}

type CallBack =
  (err?: NodeJS.ErrnoException | null, obj?: JSON | null) => void
type Primitives =
  string | number | boolean | symbol
type JSON = {
  [P in keyof any]: Primitives | JSON
}

function readFileWithCallback (file: string, options: Options | string = {}, callback: CallBack = () => {}) {
  const optionsObj = typeof options === 'string' ?
    { encoding: options }
    :
    options
  const fs: fs = optionsObj.fs || _fs
  const shouldThrow: boolean = optionsObj.throws !== undefined ? optionsObj.throws : true

  fs.readFile(file, options, (err, data) => {
    if (err)
      return callback(err)

    Result<JSON, NodeJS.ErrnoException >(() => JSON.parse(stripBom(data), optionsObj.reviver))
      .bind(
        obj => callback( null, obj ),
        err2 => {
          if (shouldThrow) {
            err2.message = `${file}: ${err2.message}`
            callback(err2)
          } else {
            callback(null, null)
          }
          return err2
        }
      )
  })
}

const readFile = universalify.fromCallback(readFileWithCallback)

function readFileSync (file: string, options: Options | string = {}) {
  const optionsObj = typeof options === 'string' ?
    { encoding: options }
    :
    options
  const fs: fs = optionsObj.fs || _fs
  const shouldThrow = optionsObj.throws !== undefined ? optionsObj.throws : true
  try {
    const content = fs.readFileSync(file, options)
    return JSON.parse(
      stripBom(content),
      optionsObj.reviver
    )
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file}: ${err.message}`
      throw err
    } else {
      return null
    }
  }
}

type StringificationOptions = {
  spaces?: string | number | undefined,
  EOL?: string,
  replacer?: (this: any, key: string, value: any) => any
}

function stringify(obj: any, options: StringificationOptions = {}) {
  const spaces = options.spaces
  const EOL = options.EOL || '\n'
  const str = JSON.stringify(obj, options ? options.replacer : undefined, spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function writeFileWithCallback (
  file: string,
  obj: any, options: Options & StringificationOptions = {},
  callback: CallBack = () => {}
) {
  const fs = options.fs || _fs

  Result<string, NodeJS.ErrnoException>( () => stringify(obj, options) )
    .bind(
      undefined,
      err => {
        callback(err, null)
        return Success("")
      }
    )
    .bind(
      str => fs.writeFile(file, str, options, callback)
    )
}

const writeFile = universalify.fromCallback(writeFileWithCallback)

function writeFileSync (file: string, obj: any, options: Options & StringificationOptions = {}) {
  const fs = options.fs || _fs

  const str = stringify(obj, options)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function stripBom (content: string | Buffer) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  const file = Buffer.isBuffer(content) ?
    content.toString('utf8')
    :
    content
  return file.replace(/^\uFEFF/, '')
}

export {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}
