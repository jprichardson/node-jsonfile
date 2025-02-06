// Simulate the scenario where `graceful-fs` is not available
jest.mock('graceful-fs', () => {
  throw new Error('Cannot find module "graceful-fs"');
}, { virtual: true });

// Ensure that `fs` can be loaded as a fallback
jest.mock('fs', () => jest.requireActual('fs'), { virtual: true });

const jsonfile = require('../');
const mockFs = require('mock-fs');
  
describe('jsonfile operations', () => {
  beforeEach(() => {
    // Setup mock filesystem
    mockFs({
      'example.json': '{"name":"test"}'
    });
  });

  afterEach(() => {
    // Restore the filesystem after each test
    mockFs.restore();
    jest.resetModules(); // Reset modules to clear caches and mocks
  });

  test('readFile should fallback to native fs when graceful-fs fails', async () => {
    /**
     * Sample 2
     * BlockStatement
     * index.js:4:13
     * - } catch (_) {
     * - _fs = require('fs')
     * - }
     * + } catch (_) {}
    */
    
    let data;
    let errorCaught = false;
    try {
      data = await jsonfile.readFile('example.json');
    } catch (error) {
      errorCaught = true;
    }

    expect(errorCaught).toBe(false);
    expect(data).toEqual({ name: 'test' });
  });
});

describe('stripBom function tests', () => {
  const { stripBom } = require('../utils');
  
  test('should throw an error when content is an object, not a buffer', () => {
    /**
     * Sample 1
    * ConditionalExpression
    * utils.js:10:7
    * - if (Buffer.isBuffer(content)) content = content.toString('utf8')
    * + if (true) content = content.toString('utf8')
    */
    const inputObject = { toString: () => "Hello, world!" }; // A mock object with a custom toString method
    expect(() => {
      stripBom(inputObject);
    }).toThrow(TypeError);
  });

  test('should not remove the BOM if it is not at the beginning of the string', () => {
    /**
     * Sample 3
     * Regex
     * utils.js:11:26
     * -     return content.replace(/^\\uFEFF/, '')
     * +     return content.replace(/\\uFEFF/, '')
     */
    input = `Some \uFEFF content\uFEFF with BOM inside`
    const result = stripBom(Buffer.from(input, 'utf8'));
    expect(result).toBe(input);
  });
  
});

describe('Encoding Handling in readFile()', () => {
  rimraf = require('rimraf');
  os = require('os');
  path = require('path');
  const jsonfile = require('../');
  fs = require('fs');
  let TEST_DIR;

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-encoding');
    rimraf.sync(TEST_DIR);
    fs.mkdirSync(TEST_DIR);
  });

  afterEach(() => {
    rimraf.sync(TEST_DIR);
  });

  test('should respect encoding option when passed as a string', async () => {
    /**
     * Sample 4
     * ObjectLiteral
     * index.js:12:15
     * -       options = { encoding: options }
     * +       options = {}
     */
    
    const file = path.join(TEST_DIR, 'encoding-test.json');
    const obj = { message: 'hello' };

    // Write file in UTF-16LE encoding
    fs.writeFileSync(file, JSON.stringify(obj), 'utf16le');

    // Attempt to read file with correct encoding
    const data = await jsonfile.readFile(file, 'utf16le');

    // Verify it is parsed correctly
    expect(data).toEqual(obj);
  });
});

describe('Encoding Handling in readFileSync()', () => {
rimraf = require('rimraf');
os = require('os');
path = require('path');
const jsonfile = require('../');
fs = require('fs');
let TEST_DIR;

beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'jsonfile-tests-encoding');
    rimraf.sync(TEST_DIR);
    fs.mkdirSync(TEST_DIR);
});

afterEach(() => {
    rimraf.sync(TEST_DIR);
});

test('should respect encoding option when passed as a string in readFileSync', () => {
    /**
     * Sample 5
     * ObjectLiteral
     * index.js:42:15
     * -       options = { encoding: options }
     * +       options = {}
     */
  
    const file = path.join(TEST_DIR, 'encoding-test-sync.json');
    const obj = { message: 'hello' };

    // Write file in UTF-16LE encoding
    fs.writeFileSync(file, JSON.stringify(obj), 'utf16le');

    // Attempt to read file with correct encoding
    const data = jsonfile.readFileSync(file, 'utf16le');

    // Verify it is parsed correctly
    expect(data).toEqual(obj);
});
});
