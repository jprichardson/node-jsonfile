import * as fs from 'fs'
let _fs: fs

try {
   _fs = require('graceful-fs')
} catch (_) {
  _fs = fs
}

import * as universalify from 'universalify'
import { Result } from "amonad"

type fs = typeof fs

export type Options = {
  encoding?: string | null;
  flag?: string;
  fs?: fs
  throws?: boolean,
  reviver?: (this: any, key: string, value: any) => any
}
export type StringificationOptions = {
  spaces?: string | number | undefined,
  EOL?: string,
  replacer?: (this: any, key: string, value: any) => any
}

type CallBack =
  (err?: NodeJS.ErrnoException | null, obj?: JSON | null) => void
type Primitives =
  string | number | boolean | symbol
export type JSON = {
  [P in keyof any]: Primitives | JSON
}

// *** Public API ***

function readFileWithCallback(
    file: string,
    options?: Options | string | CallBack | null,
    callback: CallBack = options as CallBack
) {
  const optionsObj = typeof options === 'string' ?
    { encoding: options }
    :
      isCallback(options) || !options ?
        {}
      :
        options
  const fs: fs = optionsObj.fs || _fs
  const shouldThrow: boolean = optionsObj.throws !== undefined ? optionsObj.throws : true

  fs.readFile(file, optionsObj, (err, data) => {
    if (err)
      return callback(err)

    Result<JSON, NodeJS.ErrnoException >(
      () => JSON.parse(stripBom(data), optionsObj.reviver)
    )
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

function writeFileWithCallback (
  file: string,
  obj: any,
  options: Options & StringificationOptions | null | string | CallBack = {},
  callback: CallBack = options as CallBack
) {
  const optionsObj = typeof options === "string" ?
    { encoding: options }
    : options === null || isCallback(options) ?
      {}
      :
      options
  const fs = optionsObj.fs || _fs

  Result<string, NodeJS.ErrnoException>(
    () => stringify(obj, optionsObj)
  )
    .bind(
      str => fs.writeFile(file, str, optionsObj, callback),
      err => {
        callback(err, null)
        throw err
      }
    )
}

function writeFileSync(file: string, obj: any, options: Options & StringificationOptions | string = {}) {
  const optionsObj = typeof options === 'string' ?
    { encoding: options }
    :
    options
  const fs = optionsObj.fs || _fs

  const str = stringify(obj, optionsObj)
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

// *** Support function ***

function isCallback( value: any ): value is CallBack {
  return typeof value === 'function'
}

function stringify(obj: any, options: StringificationOptions = {}) {
  const spaces = options.spaces
  const EOL = options.EOL || '\n'
  const str = JSON.stringify(obj, options ? options.replacer : undefined, spaces)

  return str.replace(/\n/g, EOL) + EOL
}

function stripBom (content: string | Buffer) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  const file = Buffer.isBuffer(content) ?
    content.toString('utf8')
    :
    content
  return file.replace(/^\uFEFF/, '')
}

// *** Export ***

function readFile(
  file: string
): Promise<JSON>
function readFile(
  file: string,
  options?: Options | string | null
): Promise<JSON>
function readFile(
  file: string,
  options?: CallBack
): void
function readFile(
  file: string,
  options: Options | string | null,
  callback: CallBack
): void
function readFile(...args: any[]) {
  return universalify.fromCallback(readFileWithCallback)(...args)
}

function writeFile(
  file: string,
  obj: any
): Promise<JSON>
function writeFile(
  file: string,
  obj: any,
  options: CallBack
 ): void
 function writeFile(
  file: string,
  obj: any,
  options: Options & StringificationOptions | string | null
 ): Promise<void>
 function writeFile(
  file: string,
  obj: any,
  options: Options & StringificationOptions | string | null,
  callback: null
 ): Promise<void>
 function writeFile(
  file: string,
  obj: any,
  options: Options & StringificationOptions | string | null,
  callback: CallBack
 ): void

 function writeFile(...args: any[]) {
   return universalify.fromCallback(writeFileWithCallback)(...args)
 }

export {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
}
