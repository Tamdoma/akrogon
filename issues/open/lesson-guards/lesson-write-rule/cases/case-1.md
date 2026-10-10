# Case 1 — repeat with the same failure cause

Consumer repo: Tamdoma/tamdoma-framework (registered root /home/ivan/Work/infra/tamdoma/framework).

Active list excerpt (the repo's learnings/LESSONS.md):

```text
- 2026-10-08: a determinism test that executes the real generator rewrites the tracked artifact it checks — mechanism: `manifest-deterministic.test.ts` runs full `generate-checksums.ts` twice per selftest and the generator unconditionally writes `checksums.json`, so every whole run re-dirties the tree when the committed file is stale; re-checkout generated files before asserting a clean tree; see learnings/history/2026-10-08-manifest-determinism-rewrites-checksums.md.
```

History file `learnings/history/2026-10-08-manifest-determinism-rewrites-checksums.md` (verbatim, no report link):

```markdown
# 2026-10-08: manifest-deterministic selftest rewrites checksums.json every run

## Case

During hot-suite-concurrency, two consecutive full `framework:verify` runs each
left `.claude/hooks/checksums.json` dirty with the same unrelated entries
(`tests/composition-authority-spine.test.ts`, `tests/composition-spine.test.ts`,
new `tests/family-membership-spine.test.ts`,
`tests/scan-section-shape-alignment.test.ts`), while the leaf's own surgical
entry stayed correct. Both times the dirt had to be reverted before a phase
move (`akrogon phase` refuses a dirty worktree).

## Evidence

- `manifest-deterministic.test.ts:119-122` runs the full
  `generate-checksums.ts` twice per selftest; the generator unconditionally
  `writeFileSync`s `checksums.json` (`generate-checksums.ts:65`).
- `hooks:selftest` runs in the fast lane of every full verify, so any committed
  staleness in `checksums.json` re-dirties the tree on every whole run.
- Observed on framework heads `741ce20cd` and `71b670527` (2026-10-08 runs).

## Abstract learning

A determinism test that executes the real generator rewrites the tracked
artifact it checks. After any whole run, re-checkout generated files before
asserting a clean tree or moving phase; treat the rewrite as expected noise
and keep leaf checksum updates surgical.
```

New occurrence (what the seat just saw, same run today): a full `framework:verify` run again left `.claude/hooks/checksums.json` dirty with unrelated regenerated entries, on framework head `c9e2a1f`.

