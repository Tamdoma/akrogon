import { readFileSync } from 'node:fs';
import { expect, test, type Page, type Locator } from '@playwright/test';

const docs: URL = new URL('../../docs/', import.meta.url);
const destinations: string[] = [
  'index',
  'idea',
  'parts',
  'state',
  'install',
  'setup',
  'create',
  'next',
  'phases',
  'files',
  'merge',
  'in-practice',
  'limits',
  'problems',
  'learn',
  'cheat',
].map((name: string): string => `${name}.html`);
const guide: string = readFileSync(new URL('guide.html', docs), 'utf8');

function extract(source: string, start: string, end: string): string {
  const offset: number = source.indexOf(start);
  expect(offset).toBeGreaterThanOrEqual(0);
  const finish: number = source.indexOf(end, offset);
  expect(finish).toBeGreaterThan(offset);
  return source.slice(offset, finish + end.length);
}

async function fonts(page: Page): Promise<void> {
  await page.evaluate(async (): Promise<void> => {
    await document.fonts.ready;
  });
  expect(
    await page.evaluate((): string[] =>
      Array.from(document.fonts)
        .filter((font: FontFace): boolean => font.status === 'loaded')
        .map((font: FontFace): string => font.family),
    ),
  ).toEqual(expect.arrayContaining(['Spectral', 'Bricolage Grotesque', 'Martian Mono']));
}

async function reveal(page: Page): Promise<void> {
  for (const element of await page.locator('main [data-animate]').all()) {
    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveCSS('opacity', '1');
  }
}

async function styles(locator: Locator): Promise<string[]> {
  return locator.evaluateAll((elements: Element[]): string[] =>
    elements.map((element: Element): string => {
      const css: CSSStyleDeclaration = getComputedStyle(element);
      return [
        css.fontFamily,
        css.fontSize,
        css.fontWeight,
        css.lineHeight,
        css.color,
        css.backgroundColor,
        css.display,
        css.gridTemplateColumns,
        css.gap,
        css.padding,
        css.maxWidth,
      ].join('|');
    }),
  );
}

const pages: { name: string; ids: string[] }[] = [
  { name: 'in-practice', ids: ['day', 'cases'] },
  { name: 'limits', ids: ['limits'] },
  { name: 'problems', ids: ['problems'] },
  { name: 'learn', ids: ['learn'] },
  { name: 'cheat', ids: ['cheat'] },
];
const idea: string = readFileSync(new URL('idea.html', docs), 'utf8');

for (const { name, ids } of pages) {
  test(`${name} preserves source and renders`, async ({ page, context }, testInfo): Promise<void> => {
    const html: string = readFileSync(new URL(`${name}.html`, docs), 'utf8');
    const sections: string[] = ids.map((id: string): string =>
      extract(guide, id === 'cheat' ? '<section class="ink-band" id="cheat"' : `<section id="${id}"`, '</section>'),
    );
    const content: string = sections
      .map((section: string, index: number): string =>
        ['cases', 'problems'].includes(ids[index]) ? `<div class="band">\n${section}\n</div>` : section,
      )
      .join('\n\n');
    expect(extract(html, '<main id="top">', '</main>')).toBe(
      `<main id="top">\n${name === 'in-practice' ? '<div class="wrap hero"><h1>In practice</h1></div>\n' : ''}${content}\n</main>`,
    );
    expect(html).not.toMatch(/<style\b/i);
    for (const [start, end] of [
      ['<footer class="footer"', '</footer>'],
      ['<script>', '</script>'],
      ['<a class="logo"', '</a>'],
    ]) {
      expect(extract(html, start, end)).toBe(extract(idea, start, end));
    }
    expect(extract(html, '<link rel="preconnect"', '</head>')).toBe(extract(idea, '<link rel="preconnect"', '</head>'));
    await page.goto(new URL(`${name}.html`, docs).href);
    await fonts(page);
    const nav: Locator = page.getByRole('navigation', { name: 'Pages' });
    expect(
      await nav
        .locator('a')
        .evaluateAll((links: Element[]): (string | null)[] =>
          links.map((link: Element): string | null => link.getAttribute('href')),
        ),
    ).toEqual(destinations);
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', `${name}.html`);
    await expect(page.locator('main section')).toHaveCount(ids.length);
    if (name === 'in-practice') await expect(page.locator('h1')).toHaveText('In practice');
    await reveal(page);
    const source: Page = await context.newPage();
    await source.goto(new URL('guide.html', docs).href);
    await fonts(source);
    for (const id of ids) {
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
      const selector: string = `#${id}, #${id} h2, #${id} h3, #${id} h4, #${id} p, #${id} .eyebrow, #${id} .card, #${id} pre, #${id} .tbl`;
      expect(await styles(page.locator(selector))).toEqual(await styles(source.locator(selector)));
      expect(
        await page
          .locator(`#${id}`)
          .evaluate((section: HTMLElement): string => getComputedStyle(section.parentElement!).backgroundColor),
      ).toBe(
        await source
          .locator(`#${id}`)
          .evaluate((section: HTMLElement): string => getComputedStyle(section.parentElement!).backgroundColor),
      );
    }
    if (name === 'in-practice') {
      const dayGeometry: string[][] = [];
      for (const documentPage of [source, page]) {
        dayGeometry.push(
          await documentPage.locator('#day, #day pre').evaluateAll((elements: HTMLElement[]): string[] =>
            elements.map((element: HTMLElement): string => {
              const rect: DOMRect = element.getBoundingClientRect();
              return [
                rect.left,
                rect.right,
                rect.width,
                element.clientWidth,
                element.scrollWidth,
                getComputedStyle(element).overflowX,
              ].join('|');
            }),
          ),
        );
      }
      expect(dayGeometry[1]).toEqual(dayGeometry[0]);
      expect(await page.evaluate((): number => document.documentElement.scrollWidth)).toBe(
        await page
          .locator('#day')
          .evaluate((section: HTMLElement): number => Math.max(window.innerWidth, section.scrollWidth)),
      );
    } else {
      expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await source.close();
    for (const id of ids.filter((id: string): boolean => id !== 'day')) {
      expect(
        await page
          .locator(`#${id}`)
          .evaluate((section: HTMLElement): boolean => section.scrollWidth <= window.innerWidth),
      ).toBe(true);
      for (const block of await page.locator(`#${id} pre, #${id} .tbl`).all()) {
        expect(
          await block.evaluate((element: HTMLElement): boolean => {
            const rect: DOMRect = element.getBoundingClientRect();
            return rect.left >= 0 && rect.right <= window.innerWidth && getComputedStyle(element).overflowX === 'auto';
          }),
        ).toBe(true);
      }
    }
    for (const anchor of await page.locator('a[href^="#"]').all()) {
      const href: string = (await anchor.getAttribute('href')) as string;
      await expect(page.locator(`[id="${href.slice(1)}"]`)).toHaveCount(1);
    }
    await page.evaluate((): void => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(page.locator('header')).toHaveCSS('position', 'sticky');
    expect(
      await page.locator('header').evaluate((header: HTMLElement): number => header.getBoundingClientRect().top),
    ).toBe(0);
    for (const link of await nav.locator('a').all()) await expect(link).toBeInViewport();
    await page.evaluate((): void => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    for (const id of ids) {
      await page.goto(new URL(`${name}.html#${id}`, docs).href);
      await expect(page).toHaveURL(new URL(`${name}.html#${id}`, docs).href);
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });
}

test('reader follows practice navigation back home', async ({ page }): Promise<void> => {
  await page.goto(new URL('index.html', docs).href);
  for (const name of [...pages.map((entry: { name: string; ids: string[] }): string => entry.name), 'index']) {
    await page.locator(`nav a[href="${name}.html"]`).click();
    await expect(page).toHaveURL(new URL(`${name}.html`, docs).href);
    await expect(page.locator('nav [aria-current]')).toHaveCount(1);
    await expect(page.locator('nav [aria-current="page"]')).toHaveAttribute('href', `${name}.html`);
  }
});
