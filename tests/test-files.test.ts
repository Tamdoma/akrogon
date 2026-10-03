import { test, expect } from 'bun:test';
import { testFile } from '../src/test-files';

test('test-file rule matches every locked directory segment and stays case-sensitive', () => {
  const segments: readonly string[] = [
    'test',
    'tests',
    '__tests__',
    'fixture',
    'fixtures',
    '__fixtures__',
    '__snapshots__',
    'e2e',
    'spec',
    'specs',
    'testdata',
    'golden',
    'goldens',
  ];
  for (const segment of segments) {
    expect(testFile(`${segment}/file.ts`)).toBe(true);
    expect(testFile(`src/${segment}/file.ts`)).toBe(true);
    expect(testFile(`src/${segment.toUpperCase()}/file.ts`)).toBe(false);
    expect(testFile(`src/${segment}-other/file.ts`)).toBe(false);
  }
});

test('test-file rule matches every basename pattern and rejects unrelated names', () => {
  const matching: readonly string[] = ['x.test.ts', 'x.spec.ts', 'x.e2e.ts', 'x_test.ts', 'x.snap'];
  const nonmatching: readonly string[] = [
    'file',
    'src/new.ts',
    'x.test',
    'x.spec',
    'x.e2e',
    'x_test',
    'x.test.',
    '.test.ts',
    'x.TEST.ts',
    'x.SPEC.ts',
    'x.E2E.ts',
    'x_TEST.ts',
    'x.SNAP',
    'x.snap.ts',
  ];
  for (const path of matching) expect(testFile(`src/${path}`)).toBe(true);
  for (const path of nonmatching) expect(testFile(path)).toBe(false);
});
