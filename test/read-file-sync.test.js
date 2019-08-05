const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')
const jf = require('../')

/* global describe it beforeEach afterEach */

describe('+ readFileSync()', () => {
  let TEST_DIR

  beforeEach((done) => {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-readfile-sync')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach((done) => {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('should read and parse JSON', () => {
    const file = path.join(TEST_DIR, 'somefile3.json')
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
      const fn = 'somefile.json'
      const file = path.join(TEST_DIR, fn)
      fs.writeFileSync(file, '{')

      assert.throws(() => {
        jf.readFileSync(file)
      }, (err) => {
        assert(err instanceof Error)
        assert(err.message.match(fn))
        return true
      })
    })
  })

  describe('> when invalid JSON and throws set to false', () => {
    it('should return null', () => {
      const file = path.join(TEST_DIR, 'somefile4-invalid.json')
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
      const file = path.join(TEST_DIR, 'somefile4-invalid.json')
      const data = '{not valid JSON'
      fs.writeFileSync(file, data)

      assert.throws(() => {
        jf.readFileSync(file, { throws: true })
      })
    })
  })

  describe('> when json file is missing and throws set to false', () => {
    it('should return null', () => {
      const file = path.join(TEST_DIR, 'somefile4-invalid.json')

      const obj = jf.readFileSync(file, { throws: false })
      assert.strictEqual(obj, null)
    })
  })

  describe('> when json file is missing and throws set to true', () => {
    it('should throw an exception', () => {
      const file = path.join(TEST_DIR, 'somefile4-invalid.json')

      assert.throws(() => {
        jf.readFileSync(file, { throws: true })
      })
    })
  })

  describe('> when JSON reviver is set', () => {
    it('should transform the JSON', () => {
      const file = path.join(TEST_DIR, 'somefile.json')
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
      const file = path.join(TEST_DIR, 'somefile.json')

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
      const file = path.join(TEST_DIR, 'file-bom.json')
      const obj = { name: 'JP' }
      fs.writeFileSync(file, `\uFEFF${JSON.stringify(obj)}`)
      const data = jf.readFileSync(file)
      assert.deepStrictEqual(obj, data)
    })
  })
})
