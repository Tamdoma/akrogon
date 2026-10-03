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

const basenames: readonly RegExp[] = [/^.+\.test\..+$/, /^.+\.spec\..+$/, /^.+\.e2e\..+$/, /^.+_test\..+$/];

export function testFile(path: string): boolean {
  const parts: string[] = path.split('/');
  const name: string = parts[parts.length - 1];
  return (
    parts.some((segment) => segments.includes(segment)) ||
    name.endsWith('.snap') ||
    basenames.some((re) => re.test(name))
  );
}
