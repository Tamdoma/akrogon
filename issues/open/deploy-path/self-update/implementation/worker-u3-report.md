# Worker report: brief-3 (self-update guide)

Commit: 7ea493dfc779b62584a5926ad297c16a5b19e50c

Changed files and reasons: docs/guide/install.md — replaced lines 37-41 (`git pull` instruction) with three paragraphs: the self-update step (triggers, fetch, fast-forward when strictly behind, `bun install --frozen-lockfile`, skill-link reconcile), its one-line output (`deployed <old>..<new>`, `current <sha>`, otherwise failing step + error + lag count + remedy), when the operator still acts (other branch/detached, ahead or diverged → `akrogon sync`, overlapping uncommitted edit → commit or finish it), and that a failed step retries at the next trigger.

Tests run:
- `AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000` — pass, 0 tests affected (docs-only change)
- `bun test tests/docs-links.test.ts --timeout=30000` — 4 pass, 0 fail

Known limitations: none known.

Unverified criteria: none. No `git pull` remains; prose only, no new headings.
