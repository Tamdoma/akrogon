import { test, expect } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

const repoRoot: string = resolve(import.meta.dir, '..');
const CHARTING_PAGES: string[] = [
  'docs/guide/04-a-charting-session.md',
  'docs/guide/05-signposts.md',
  'docs/guide/06-charting-mode.md',
  'docs/guide/07-build-route.md',
  'docs/guide/08-hand-off.md',
];
const SETUP_PAGES: string[] = [
  'docs/guide/01-install.md',
  'docs/guide/02-set-up-a-repo.md',
  'docs/guide/03-your-three-tabs.md',
];
const HERO: RegExp = /!\[([^\]]*)\]\(docs\/pictures\/three-tabs\.svg\)/;
// Page 04's tab section links to page 03, whose picture shows the tabs.
const NO_PICTURE_HEADING: string = 'Where you chart';
const EMBED: RegExp = /!\[([^\]]*)\]\((\.\.\/pictures\/[^)\s]+\.svg)\)/g;
const MARK: RegExp = /<g transform="translate\([-\d.]+ [-\d.]+\)"><title>Tamdoma<\/title>[\s\S]*?<\/g>\s*<\/g>/g;
const FORBIDDEN: string[] = ['href', '<script', '@import', '@font-face', 'animation', '<animate'];

type Section = { page: string; heading: string; body: string };

function sections(root: string, pages: string[]): Section[] {
  return pages.flatMap((page: string): Section[] =>
    readFileSync(join(root, page), 'utf8')
      .split(/^## /m)
      .slice(1)
      .map((chunk: string): Section => {
        const end: number = chunk.indexOf('\n');
        return { page, heading: chunk.slice(0, end).trim(), body: chunk.slice(end + 1) };
      }),
  );
}

function sectionsWithoutPicture(root: string, pages: string[]): string[] {
  return sections(root, pages)
    .filter((section: Section): boolean => !section.heading.startsWith(NO_PICTURE_HEADING))
    .filter(
      (section: Section): boolean =>
        ![...section.body.matchAll(EMBED)].some((match: RegExpMatchArray): boolean => match[1].trim() !== ''),
    )
    .map((section: Section): string => `${section.page}: ## ${section.heading}`);
}

function embeddedPictures(root: string, pages: string[]): string[] {
  const pictures: string[] = pages.flatMap((page: string): string[] =>
    [...readFileSync(join(root, page), 'utf8').matchAll(EMBED)].map((match: RegExpMatchArray): string =>
      relative(root, resolve(dirname(join(root, page)), match[2])),
    ),
  );
  return [...new Set(pictures)].sort();
}

function pictureProblems(root: string, pages: string[]): string[] {
  const problems: string[] = [];
  const marks: Map<string, string> = new Map<string, string>();
  for (const picture of embeddedPictures(root, pages)) {
    const svg: string = readFileSync(join(root, picture), 'utf8');
    for (const token of FORBIDDEN) {
      if (svg.toLowerCase().includes(token.toLowerCase())) problems.push(`${picture}: holds ${token}`);
    }
    const groups: string[] = svg.match(MARK) ?? [];
    const titles: number = svg.split('<title>Tamdoma</title>').length - 1;
    if (groups.length !== 1 || titles !== 1) {
      problems.push(`${picture}: ${groups.length} mark groups, ${titles} Tamdoma titles`);
      continue;
    }
    if (!groups[0].includes('>created by</text>')) problems.push(`${picture}: mark group has no "created by" text`);
    marks.set(picture, groups[0].replace(/^<g transform="translate\([^)]*\)">/, ''));
  }
  const first: string | undefined = [...marks.values()][0];
  for (const [picture, mark] of marks) {
    if (mark !== first) problems.push(`${picture}: mark group differs from the others apart from its translate`);
  }
  return problems;
}

test('every section of guide pages 04 to 08 has a picture with alt text, except the c- tab section', (): void => {
  expect(sections(repoRoot, CHARTING_PAGES).length).toBeGreaterThan(20);
  expect(sectionsWithoutPicture(repoRoot, CHARTING_PAGES)).toEqual([]);
});

test('every picture on guide pages 04 to 08 holds one identical mark group and no outside or moving markup', (): void => {
  const pictures: string[] = embeddedPictures(repoRoot, CHARTING_PAGES);
  expect(pictures).toContain('docs/pictures/charting-session.svg');
  expect(pictures).toContain('docs/pictures/mode-and-route.svg');
  expect(pictureProblems(repoRoot, CHARTING_PAGES)).toEqual([]);
});

function heroAlt(root: string): string {
  const hero: RegExpMatchArray | null = readFileSync(join(root, 'README.md'), 'utf8').match(HERO);
  return hero === null ? '' : hero[1].trim();
}

test('README embeds the three-tabs hero picture with alt text', (): void => {
  expect(heroAlt(repoRoot)).not.toBe('');
});

test('every section of guide pages 01 to 03 has a picture with alt text', (): void => {
  expect(sections(repoRoot, SETUP_PAGES).length).toBeGreaterThan(10);
  expect(sectionsWithoutPicture(repoRoot, SETUP_PAGES)).toEqual([]);
});

test('every picture on guide pages 01 to 03 holds the charting pictures mark group and no outside or moving markup', (): void => {
  expect(pictureProblems(repoRoot, [...CHARTING_PAGES, ...SETUP_PAGES])).toEqual([]);
  expect(embeddedPictures(repoRoot, ['docs/guide/02-set-up-a-repo.md'])).toContain(
    'docs/pictures/one-akrogon-many-repos.svg',
  );
  expect(embeddedPictures(repoRoot, ['docs/guide/03-your-three-tabs.md'])).toContain('docs/pictures/three-tabs.svg');
});

test('the picture checks catch a missing picture, blank alt, a changed mark group and forbidden markup', (): void => {
  const dir: string = mkdtempSync(join(tmpdir(), 'akrogon-pictures-'));
  const mark: (x: number, y: number, scale: string) => string = (x: number, y: number, scale: string): string =>
    `<g transform="translate(${x} ${y})"><title>Tamdoma</title>\n  <text x="0" y="0">created by</text>\n  <g transform="translate(8 -14) scale(${scale})"><path d="M0 0"/></g>\n</g>`;
  const svg: (body: string) => string = (body: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>\n`;
  try {
    mkdirSync(join(dir, 'docs', 'guide'), { recursive: true });
    mkdirSync(join(dir, 'docs', 'pictures'), { recursive: true });
    const page: string = 'docs/guide/04-a-charting-session.md';
    const pages: string[] = [page];
    writeFileSync(join(dir, 'docs/pictures/a.svg'), svg(mark(838, 418, '0.05')));
    writeFileSync(join(dir, 'docs/pictures/b.svg'), svg(mark(838, 442, '0.05')));
    writeFileSync(
      join(dir, page),
      '# Page\n\n![Opener](../pictures/a.svg)\n\n## Where you chart: the `c-` tab\n\nSee page 03.\n\n## One\n\n![One picture](../pictures/a.svg)\n\n## Two\n\nText.\n\n![Two picture](../pictures/b.svg)\n\n## Three\n\n![ ](../pictures/b.svg)\n\n## Four\n\nNo picture.\n',
    );
    expect(sectionsWithoutPicture(dir, pages)).toEqual([`${page}: ## Three`, `${page}: ## Four`]);
    expect(pictureProblems(dir, pages)).toEqual([]);

    writeFileSync(join(dir, 'docs/pictures/b.svg'), svg(mark(838, 442, '0.06')));
    expect(pictureProblems(dir, pages)).toEqual([
      'docs/pictures/b.svg: mark group differs from the others apart from its translate',
    ]);

    writeFileSync(join(dir, 'docs/pictures/b.svg'), svg('<text>created by</text>\n<g><title>Tamdoma</title></g>'));
    expect(pictureProblems(dir, pages)).toEqual(['docs/pictures/b.svg: 0 mark groups, 1 Tamdoma titles']);

    writeFileSync(join(dir, 'docs/pictures/b.svg'), svg(mark(838, 442, '0.05').replace('>created by<', '>made by<')));
    expect(pictureProblems(dir, pages)).toEqual([
      'docs/pictures/b.svg: mark group has no "created by" text',
      'docs/pictures/b.svg: mark group differs from the others apart from its translate',
    ]);

    const tokens: string[] = [
      '<a href="https://example.com"><text>x</text></a>',
      '<image xlink:href="logo.png"/>',
      '<script>alert(1)</script>',
      '<style>@import url(x.css);</style>',
      '<style>@font-face { font-family: X; }</style>',
      '<style>text { animation: spin 1s; }</style>',
      '<animate attributeName="x" to="1"/>',
    ];
    const expected: string[] = ['href', 'href', '<script', '@import', '@font-face', 'animation', '<animate'].map(
      (token: string): string => `docs/pictures/b.svg: holds ${token}`,
    );
    tokens.forEach((body: string, i: number): void => {
      writeFileSync(join(dir, 'docs/pictures/b.svg'), svg(`${body}\n${mark(838, 442, '0.05')}`));
      expect(pictureProblems(dir, pages)).toEqual([expected[i]]);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
