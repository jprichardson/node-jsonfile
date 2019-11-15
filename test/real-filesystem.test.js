const path = require('path')
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const rimraf = require('rimraf')
const jf = require('..')

/* global describe it beforeEach afterEach */

describe('on real filesystem in temp directory', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests')
    rimraf.sync(TEST_DIR)
    fs.mkdir(TEST_DIR, done)
  })

  afterEach(done => {
    rimraf.sync(TEST_DIR)
    done()
  })

  it('readFileSync', () => {
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

  it('readFile', (done) => {
    const file = path.join(TEST_DIR, 'somefile.json')
    const obj = { name: 'JP' }
    fs.writeFileSync(file, JSON.stringify(obj))

    jf.readFile(file, (err, obj2) => {
      assert.ifError(err)
      assert.strictEqual(obj2.name, obj.name)
      done()
    })
  })

  it('writeFileSync', () => {
    const file = path.join(TEST_DIR, 'somefile4.json')
    const obj = { name: 'JP' }

    jf.writeFileSync(file, obj)

    const data = fs.readFileSync(file, 'utf8')
    const obj2 = JSON.parse(data)
    assert.strictEqual(obj2.name, obj.name)
    assert.strictEqual(data[data.length - 1], '\n')
    assert.strictEqual(data, '{"name":"JP"}\n')
  })

  it('writeFile', (done) => {
    const file = path.join(TEST_DIR, 'somefile2.json')
    const obj = { name: 'JP' }

    jf.writeFile(file, obj, (err) => {
      assert.ifError(err)
      fs.readFile(file, 'utf8', (err, data) => {
        assert.ifError(err)
        const obj2 = JSON.parse(data)
        assert.strictEqual(obj2.name, obj.name)

        // verify EOL
        assert.strictEqual(data[data.length - 1], '\n')
        done()
      })
    })
  })
})
