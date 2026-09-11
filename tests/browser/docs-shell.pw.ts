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

test('source copies and complete file navigation', async ({ page, context }, testInfo): Promise<void> => {
  expect(readFileSync(new URL('style.css', docs), 'utf8')).toBe(extract(guide, '<style>', '</style>').slice(7, -8));
  const idea: string = readFileSync(new URL('idea.html', docs), 'utf8');
  expect(extract(idea, '<section id="idea"', '</section>')).toBe(extract(guide, '<section id="idea"', '</section>'));
  const index: string = readFileSync(new URL('index.html', docs), 'utf8');
  expect(extract(index, '<section class="hero"', '<ol class="toc"')).toBe(
    extract(guide, '<section class="hero"', '<ol class="toc"'),
  );
  for (const html of [index, idea]) {
    expect(html).not.toMatch(/<style\b/i);
    expect(extract(html, '<footer class="footer"', '</footer>')).toBe(
      extract(guide, '<footer class="footer"', '</footer>'),
    );
    expect(extract(html, '<script>', '</script>')).toBe(extract(guide, '<script>', '</script>'));
    expect(extract(html, '<a class="logo"', '</a>')).toBe(extract(guide, '<a class="logo"', '</a>'));
    expect(html).toContain(guide.slice(guide.indexOf('<link rel="preconnect"'), guide.indexOf('<style>')));
  }
  await page.goto(new URL('index.html', docs).href);
  const source: Page = await context.newPage();
  await source.goto(new URL('guide.html', docs).href);
  await fonts(source);
  for (const name of ['index', 'idea', 'index']) {
    if (name === 'idea') await page.locator('nav a[href="idea.html"]').click();
    else if (page.url().endsWith('idea.html')) await page.locator('nav a[href="index.html"]').click();
    await expect(page).toHaveURL(new URL(`${name}.html`, docs).href);
    await fonts(page);
    await expect(page.locator('main#top > section')).toHaveCount(1);
    await expect(page.locator('link[href="style.css"]')).toHaveCount(1);
    const nav: Locator = page.locator('header nav');
    expect(
      await nav
        .locator('a')
        .evaluateAll((links: Element[]): (string | null)[] =>
          links.map((link: Element): string | null => link.getAttribute('href')),
        ),
    ).toEqual(destinations);
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', `${name}.html`);
    for (const link of await nav.locator('a').all()) await expect(link).toBeInViewport();
    await reveal(page);
    await expect(page.locator('main svg.ill')).toBeVisible();
    expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const selector: string = name === 'idea' ? '#idea' : '.hero';
    expect(
      await styles(
        page.locator(
          `${selector} h1, ${selector} h2, ${selector} .lede, ${selector} .copy p, ${selector} .zig, ${selector} .eyebrow`,
        ),
      ),
    ).toEqual(
      await styles(
        source.locator(
          `${selector} h1, ${selector} h2, ${selector} .lede, ${selector} .copy p, ${selector} .zig, ${selector} .eyebrow`,
        ),
      ),
    );
    await page.evaluate((): void => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(page.locator('header')).toHaveCSS('position', 'sticky');
    expect(
      await page.locator('header').evaluate((header: HTMLElement): number => header.getBoundingClientRect().top),
    ).toBe(0);
    await page.evaluate((): void => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
  }
  const items: Locator = page.locator('.toc li');
  await expect(items).toHaveCount(16);
  expect(
    await items
      .locator('a')
      .evaluateAll((links: Element[]): (string | null)[] =>
        links.map((link: Element): string | null => link.getAttribute('href')),
      ),
  ).toEqual(destinations);
  for (const item of await items.all()) {
    const linkText: string = await item.locator('a').innerText();
    expect((await item.innerText()).replace(linkText, '').replace(/\d/g, '').trim().length).toBeGreaterThan(10);
  }
  if (testInfo.project.use.reducedMotion === 'reduce') await expect(page.locator('animateMotion')).toHaveCount(0);
  else await expect(page.locator('mpath[href="#hero-rail"]')).toHaveCount(1);
  await source.close();
});
