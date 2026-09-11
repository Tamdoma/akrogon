import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig(config, {
  testMatch: 'docs-concepts.pw.ts',
  outputDir: '../../.evidence/docs-concepts/browser',
});
