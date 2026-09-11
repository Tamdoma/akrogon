import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  testMatch: 'docs-operate.pw.ts',
  outputDir: '../../.evidence/docs-operate/browser',
});
