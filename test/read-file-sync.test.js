const assert = require('assert')
const { Volume, createFsFromVolume } = require('memfs')
const { JsonFile } = require('../')

/* global describe it beforeEach */

describe('+ readFileSync()', () => {
  let jf
  let fs

  beforeEach(() => {
    fs = createFsFromVolume(new Volume())
    jf = new JsonFile(fs)
  })

  it('should read and parse JSON', () => {
    const file = '/somefile3.json'
    const obj = { name: 'JP' }
    fs.writeFileSync(file, JSON.stringify(obj))

    try {
      const obj2 = jf.readFileSync(file)
      assert.strictEqual(obj2.name, obj.name)
    } catch (err) {
      assert(err)
    }
  })

  describe('> when invalid JSON', () => {
    it('should include the filename in the error', () => {
      const file = '/somefile.json'
      fs.writeFileSync(file, '{')

      assert.throws(
        () => {
          jf.readFileSync(file)
        },
        err => {
          assert(err instanceof Error)
          assert(err.message.match(file))
          return true
        }
      )
    })
  })

  describe('> when invalid JSON and throws set to false', () => {
    it('should return null', () => {
      const file = '/somefile4-invalid.json'
      const data = '{not valid JSON'
      fs.writeFileSync(file, data)

      assert.throws(() => {
        jf.readFileSync(file)
      })

      const obj = jf.readFileSync(file, { throws: false })
      assert.strictEqual(obj, null)
    })
  })

  describe('> when invalid JSON and throws set to true', () => {
    it('should throw an exception', () => {
      const file = '/somefile4-invalid.json'
      const data = '{not valid JSON'
      fs.writeFileSync(file, data)

      assert.throws(() => {
        jf.readFileSync(file, { throws: true })
      })
    })
  })

  describe('> when json file is missing and throws set to false', () => {
    it('should return null', () => {
      const file = '/somefile4-invalid.json'

      const obj = jf.readFileSync(file, { throws: false })
      assert.strictEqual(obj, null)
    })
  })

  describe('> when json file is missing and throws set to true', () => {
    it('should throw an exception', () => {
      const file = '/somefile4-invalid.json'

      assert.throws(() => {
        jf.readFileSync(file, { throws: true })
      })
    })
  })

  describe('> when JSON reviver is set', () => {
    it('should transform the JSON', () => {
      const file = '/somefile.json'
      const sillyReviver = function (k, v) {
        if (typeof v !== 'string') return v
        if (v.indexOf('date:') < 0) return v
        return new Date(v.split('date:')[1])
      }

      const obj = {
        name: 'jp',
        day: 'date:2015-06-19T11:41:26.815Z'
      }

      fs.writeFileSync(file, JSON.stringify(obj))
      const data = jf.readFileSync(file, { reviver: sillyReviver })
      assert.strictEqual(data.name, 'jp')
      assert(data.day instanceof Date)
      assert.strictEqual(data.day.toISOString(), '2015-06-19T11:41:26.815Z')
    })
  })

  describe('> when passing encoding string as option', () => {
    it('should not throw an error', () => {
      const file = '/somefile.json'

      const obj = {
        name: 'jp'
      }
      fs.writeFileSync(file, JSON.stringify(obj))

      let data
      try {
        data = jf.readFileSync(file, 'utf8')
      } catch (err) {
        assert.ifError(err)
      }
      assert.strictEqual(data.name, 'jp')
    })
  })

  describe('> w/ BOM', () => {
    it('should properly parse', () => {
      const file = '/fake.hypercolor'
      const obj = { name: 'JP' }
      fs.writeFileSync(file, `\uFEFF${JSON.stringify(obj)}`)
      const data = jf.readFileSync(file)
      assert.deepStrictEqual(obj, data)
    })
  })
})
