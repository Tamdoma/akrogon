import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'docs-shell.pw.ts',
  outputDir: '../../.evidence/docs-shell/browser',
  use: { browserName: 'chromium', headless: true, trace: 'on', video: 'off' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'desktop-reduced', use: { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' } },
    { name: 'mobile-reduced', use: { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' } },
  ],
});
