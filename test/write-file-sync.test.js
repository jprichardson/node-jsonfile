const assert = require('assert')
const { Volume, createFsFromVolume } = require('memfs')
const { JsonFile } = require('../')

/* global describe it beforeEach */

describe('+ writeFileSync()', () => {
  let jf
  let fs

  beforeEach(() => {
    fs = createFsFromVolume(new Volume())
    jf = new JsonFile(fs)
  })

  it('should serialize the JSON and write it to file', () => {
    const file = '/somefile4.json'
    const obj = { name: 'JP' }

    jf.writeFileSync(file, obj)

    const data = fs.readFileSync(file, 'utf8')
    const obj2 = JSON.parse(data)
    assert.strictEqual(obj2.name, obj.name)
    assert.strictEqual(data[data.length - 1], '\n')
    assert.strictEqual(data, '{"name":"JP"}\n')
  })

  describe('> when JSON replacer is set', () => {
    it('should replace JSON', () => {
      const file = '/somefile.json'
      const sillyReplacer = function (k, v) {
        if (!(v instanceof RegExp)) return v
        return `regex:${v.toString()}`
      }

      const obj = {
        name: 'jp',
        reg: new RegExp(/hello/g)
      }

      jf.writeFileSync(file, obj, { replacer: sillyReplacer })
      const data = JSON.parse(fs.readFileSync(file))
      assert.strictEqual(data.name, 'jp')
      assert.strictEqual(typeof data.reg, 'string')
      assert.strictEqual(data.reg, 'regex:/hello/g')
    })
  })

  describe('> when spaces passed as an option', () => {
    it('should write file with spaces', () => {
      const file = '/somefile.json'
      const obj = { name: 'JP' }
      jf.writeFileSync(file, obj, { spaces: 8 })
      const data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, `${JSON.stringify(obj, null, 8)}\n`)
    })

    it('should use EOL override', () => {
      const file = '/somefile.json'
      const obj = { name: 'JP' }
      jf.writeFileSync(file, obj, { spaces: 2, EOL: '***' })
      const data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, '{***  "name": "JP"***}***')
    })
  })

  describe('> when passing encoding string as options', () => {
    it('should not error', () => {
      const file = '/somefile6.json'
      const obj = { name: 'jp' }
      jf.writeFileSync(file, obj, 'utf8')
      const data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, `${JSON.stringify(obj)}\n`)
    })
  })
})
