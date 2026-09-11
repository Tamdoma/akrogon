import { readFileSync } from 'node:fs';
import { expect, test, type Page, type Locator } from '@playwright/test';

const docs: URL = new URL('../../docs/guide/', import.meta.url);
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

function extract(source: string, start: string, end: string): string {
  const offset: number = source.indexOf(start);
  expect(offset).toBeGreaterThanOrEqual(0);
  const finish: number = source.indexOf(end, offset + start.length);
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

const idea: string = readFileSync(new URL('idea.html', docs), 'utf8');
const names: string[] = ['install', 'setup', 'create', 'next', 'merge'];

function section(source: string, name: string): string {
  const document: string = source.slice(source.lastIndexOf('<section', source.indexOf(`id="${name}"`)));
  return extract(document, '<section', '</section>');
}

test('operating pages share the shell and navigate in a loop', async ({ page }, testInfo): Promise<void> => {
  test.setTimeout(90_000);
  for (const name of names) {
    const html: string = readFileSync(new URL(`${name}.html`, docs), 'utf8');
    const content: string = section(html, name);
    expect(html).not.toMatch(/<style\b/i);
    for (const [start, end] of [
      ['<head>', '</head>'],
      ['<header', '</header>'],
      ['<footer', '</footer>'],
      ['<script>', '</script>'],
    ]) {
      const expected: string = extract(idea, start, end)
        .replace('The idea · Akrogon Guide', `${extract(content, 'aria-label="', '"').slice(12, -1)} · Akrogon Guide`)
        .replace('href="idea.html" aria-current="page"', 'href="idea.html"')
        .replace(`href="${name}.html"`, `href="${name}.html" aria-current="page"`);
      expect(extract(html, start, end)).toBe(expected);
    }
  }
  await page.goto(new URL('install.html', docs).href);
  for (const name of [...names, 'install']) {
    if (!page.url().endsWith(`${name}.html`)) await page.locator(`nav a[href="${name}.html"]`).click();
    await expect(page).toHaveURL(new URL(`${name}.html`, docs).href);
    await fonts(page);
    await expect(page.locator('main section')).toHaveCount(1);
    await expect(page.locator(`main section#${name}`)).toBeVisible();
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
    expect(
      await page
        .locator('[href^="#"]')
        .evaluateAll((links: Element[]): string[] =>
          links
            .map((link: Element): string => link.getAttribute('href')!.slice(1))
            .filter((id: string): boolean => document.getElementById(id) === null),
        ),
    ).toEqual([]);
    await reveal(page);
    if (name !== 'next') {
      expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    for (const container of await page.locator('main pre, main .tbl').all()) {
      await expect(container).toHaveCSS('overflow-x', 'auto');
      expect(
        await container.evaluate((element: HTMLElement): boolean => {
          element.scrollLeft = element.scrollWidth;
          return Math.abs(element.scrollLeft - (element.scrollWidth - element.clientWidth)) <= 1;
        }),
      ).toBe(true);
      await container.evaluate((element: HTMLElement): void => {
        element.scrollLeft = 0;
      });
    }
    if (name === 'next') await expect(page.locator('main svg.ill')).toBeVisible();
    await page.evaluate((): void => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(page.locator('header')).toHaveCSS('position', 'sticky');
    expect(
      await page.locator('header').evaluate((header: HTMLElement): number => header.getBoundingClientRect().top),
    ).toBe(0);
    for (const link of await nav.locator('a').all()) await expect(link).toBeInViewport();
    await page.evaluate((): void => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
  }
});
