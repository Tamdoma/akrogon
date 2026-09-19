import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type CommandRow = { verb: string; arguments: string; effect: string };
type ArgumentGroup = { optional: boolean; alternatives: string[] };

const readme: string = readFileSync(resolve(import.meta.dir, '../README.md'), 'utf8');
const source: string = readFileSync(resolve(import.meta.dir, '../src/akrogon.ts'), 'utf8');
const contracts: Record<string, string> = {
  install: '',
  init: '[--from <proposal.yaml>] [--toolkit <lang>=<runner>]',
  config: '',
  phase: '<slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>]',
  next: '[<slug>|<path>|--all]',
  pull: '[--all]',
  sync: '',
  park: '<issue>... | --all',
  unpark: '<issue>... | --all',
  status: '[<slug>|--charts]',
};

function commandRows(markdown: string): CommandRow[] {
  const section: RegExpExecArray | null = /^## Command\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(markdown);
  if (section === null) throw new Error('Missing command reference');
  return section[1]
    .split('\n')
    .filter((line: string) => /^\|\s*`/.test(line))
    .map((line: string): CommandRow => {
      const match: RegExpExecArray | null = /^\|\s*`akrogon\s+(\S+)([^`]*)`\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
      if (match === null) throw new Error(`Invalid command row: ${line}`);
      return { verb: match[1], arguments: match[2].replaceAll('\\|', '|').trim(), effect: match[3] };
    });
}

function argumentGroups(argumentsText: string): ArgumentGroup[] {
  const groups: RegExpMatchArray[] = [...argumentsText.matchAll(/\[([^\]]*)\]|([^\[\]]+)/g)];
  expect(groups.map((match: RegExpMatchArray) => match[0]).join('')).toBe(argumentsText);
  return groups
    .filter((match: RegExpMatchArray) => match[0].trim() !== '')
    .map((match: RegExpMatchArray): ArgumentGroup => ({
      optional: match[1] !== undefined,
      alternatives: (match[1] ?? match[2])
        .split('|')
        .map((alternative: string) => alternative.trim().replace(/\s+/g, ' '))
        .sort(),
    }));
}

function checkReference(markdown: string, dispatcher: string): void {
  const dispatch: RegExpExecArray | null = /switch\s*\(verb\)\s*\{([\s\S]*)/.exec(dispatcher);
  if (dispatch === null) throw new Error('Missing CLI dispatcher');
  const verbs: string[] = [...dispatch[1].matchAll(/^\s*case\s+['"]([^'"]+)['"]\s*:/gm)].map(
    (match: RegExpMatchArray) => match[1],
  );
  const rows: CommandRow[] = commandRows(markdown);
  expect(verbs.length).toBeGreaterThan(0);
  expect(rows.map((row: CommandRow) => row.verb).sort()).toEqual([...new Set(verbs)].sort());
  for (const row of rows) {
    expect(row.effect.length).toBeGreaterThan(0);
    expect(Object.hasOwn(contracts, row.verb)).toBe(true);
    expect(argumentGroups(row.arguments)).toEqual(argumentGroups(contracts[row.verb]));
  }
}

function reference(invocations: Record<string, string> = contracts): string {
  return `## Command\n\n| Invocation | Effect |\n| --- | --- |\n${Object.entries(invocations)
    .map(([verb, args]: [string, string]) => `| \`akrogon ${verb} ${args.replaceAll('|', '\\|')}\` | Does work. |`)
    .join('\n')}\n`;
}

test('README covers every dispatched command and its argument contract', () => {
  checkReference(readme, source);
});

test('coverage rejects missing, extra and duplicate rows and newly dispatched verbs', () => {
  const valid: string = reference();
  expect(() => checkReference(valid.replace(/^\| `akrogon sync.*\n/m, ''), source)).toThrow();
  expect(() => checkReference(`${valid}| \`akrogon extra\` | Extra. |\n`, source)).toThrow();
  expect(() => checkReference(`${valid}| \`akrogon sync\` | Duplicate. |\n`, source)).toThrow();
  expect(() => checkReference(valid, source.replace('switch (verb) {', "switch (verb) {\n case 'extra':"))).toThrow();
  expect(() => checkReference(valid.replace('Does work.', ''), source)).toThrow();
});

test('argument contracts reject lost values, requiredness and exclusive alternatives', () => {
  const invalid: [string, string][] = [
    ['init', '--from [--toolkit <lang>=<runner>]'],
    ['init', '--from <proposal.yaml>'],
    ['phase', '<slug> --slot <A|B> [--verdict <verdict>]'],
    ['phase', '<slug> <phase> [--slot <A|B>] [--verdict <verdict>]'],
    ['next', '<slug>|<path>|--all'],
    ['next', '[<slug>|<path>]'],
    ['pull', '--all'],
    ['status', '<slug>'],
    ['status', '[<slug>]'],
    ['status', '--charts'],
    ...['park', 'unpark'].flatMap((verb: string): [string, string][] =>
      ['<issue>...', '--all', '<issue>... --all', '[<issue>... | --all]', '<issue> | --all'].map(
        (args: string): [string, string] => [verb, args],
      ),
    ),
  ];
  for (const [verb, args] of invalid)
    expect(() => checkReference(reference({ ...contracts, [verb]: args }), source)).toThrow();
});

test('escaped alternatives and reordered rows preserve argument semantics', () => {
  checkReference(
    reference(
      Object.fromEntries(
        Object.entries({ ...contracts, park: '--all | <issue>...', next: '[--all | <path> | <slug>]' }).reverse(),
      ),
    ),
    source,
  );
});
