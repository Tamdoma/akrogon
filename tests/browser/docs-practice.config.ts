import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  testMatch: 'docs-practice.pw.ts',
  outputDir: '../../.evidence/docs-practice/browser',
});
