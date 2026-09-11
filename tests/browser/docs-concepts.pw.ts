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

const idea: string = readFileSync(new URL('idea.html', docs), 'utf8');
const concepts: string[] = ['parts', 'state', 'phases', 'files'];
const titles: string[] = ['Every moving part', 'The state file', 'The phases', 'Where files live'];

test('concept shells and navigation', async ({ page }, testInfo): Promise<void> => {
  for (const [index, name] of concepts.entries()) {
    const html: string = readFileSync(new URL(`${name}.html`, docs), 'utf8');
    expect(
      html
        .replace(`<title>${titles[index]} · Akrogon Guide</title>`, '<title>The idea · Akrogon Guide</title>')
        .replace(`href="${name}.html" aria-current="page"`, `href="${name}.html"`)
        .replace('href="idea.html"', 'href="idea.html" aria-current="page"')
        .replace(extract(html, '<main id="top">', '</main>'), extract(idea, '<main id="top">', '</main>')),
    ).toBe(idea);
    expect(html).not.toMatch(/<style\b/i);
  }
  await page.goto(new URL('index.html', docs).href);
  for (const name of [...concepts, 'index']) {
    await page.locator(`nav a[href="${name}.html"]`).click();
    await expect(page).toHaveURL(new URL(`${name}.html`, docs).href);
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
    await fonts(page);
    await reveal(page);
    await expect(page.locator('main section')).toHaveCount(1);
    await expect(page.locator('link[href="style.css"]')).toHaveCount(1);
    if (name !== 'parts') {
      expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    for (const link of await page.locator('a[href^="#"]').all()) {
      const href: string = await link.evaluate((element: HTMLAnchorElement): string => element.hash);
      await expect(page.locator(href)).toHaveCount(1);
      await link.click();
      await expect(page).toHaveURL(new URL(`${name}.html${href}`, docs).href);
    }
    if (name !== 'index') {
      for (const container of await page.locator('main .tbl, main pre').all()) {
        await expect(container).toHaveCSS('overflow-x', 'auto');
        expect(
          await container.evaluate((element: HTMLElement): boolean => {
            element.scrollLeft = element.scrollWidth;
            return element.scrollWidth <= element.clientWidth || element.scrollLeft > 0;
          }),
        ).toBe(true);
        await container.evaluate((element: HTMLElement): void => {
          element.scrollLeft = 0;
        });
      }
      if (testInfo.project.use.reducedMotion === 'reduce') await expect(page.locator('animateMotion')).toHaveCount(0);
      await page.evaluate((): void => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
      await expect(page.locator('header')).toHaveCSS('position', 'sticky');
      expect(
        await page.locator('header').evaluate((element: HTMLElement): number => element.getBoundingClientRect().top),
      ).toBe(0);
      await page.evaluate((): void => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    }
  }
});
