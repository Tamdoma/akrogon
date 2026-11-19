# Report: claude-seats-deny-prompts

## What changed

- src/seat.ts (32bdee31, worker u1 ad4aa294 cherry-picked): `harnessArgv` merges
  `permissions.denyInsteadOfPrompting: true` into a claude line's one `--settings` JSON object in
  place (pair or equals spelling kept), appends the pair when the line has none, and refuses
  unmergeable lines with `Harness claude: --settings operand '<operand>' <reason>`. Plan D1+D2.
- docs/reference/config.md (24ac34e0, worker u2 c2f485c1 cherry-picked): `harnesses` row documents
  the merge and the refused shapes. Plan D4.
- tests/seat.test.ts (a7e928f5 committed at planning, 035a2848 prettier rewrap): the locked
  criterion tests; no expectation changed after commit.
- tests/stand-in.sh (994e2f99): the stand-in harness's arg loop now consumes the `--settings`
  pair like `--effort`/`--session-id`. Bug: the appended pair left its JSON as the first
  positional, so the stand-in logged it as the task and `hc-start`'s claude launch test red at
  verify. Fail-before: check-test-1794861671480 (`core.tasks` received the JSON string).
  Pass-after: check-hc-start-1794861769932.

## Branch

- Base AKROGON_BASE / origin/main: f10a5647fd8223a3355cf01979d9e20256f2d3d9 (fetch at pass start
  and after landing: no refresh needed, never moved).
- Committed head: 994e2f99. Worktree clean; both worker worktrees removed.

## Commands run and results

- `akrogon run-check --name seat-tests -- bun test tests/seat.test.ts` — green on the lane after
  the u1 pick: `check seat-tests: 0 .../check-seat-tests-1794861594638-1238214.log` and
  `.../check-seat-tests-1794861601934-1239121.log` (19 pass).
- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` after the u2 pick:
  `check docs-links: 0 .../check-docs-links-1794861603883-1239717.log` (12 pass).
- `akrogon run-check --name hc-start -- bun test tests/hc-start.test.ts` after the stand-in fix:
  `check hc-start: 0 .../check-hc-start-1794861769932-1768911.log` (7 pass).
- `akrogon run-check --name stale-tmp -- bun test tests/next.test.ts --test-name-pattern
  "new tab keeps existing scratch"` — green isolated rerun of the flaky verify failure:
  `check stale-tmp: 0 .../check-stale-tmp-1794861696549-1506391.log`.
- `akrogon run-check --name test-full -- bun test --timeout=30000 --parallel=4 --no-isolate` —
  first run red (hc-start only, stale-tmp green this run):
  `check test-full: 1 .../check-test-full-1794861758692-1507433.log`; after the fix:
  `check test-full: 0 .../check-test-full-1794861829099-1770307.log` (1224 pass).
- `akrogon verify` — first run red on head 24ac34e0 (hc-start + stale-tmp):
  `verify test: 1 .../check-test-1794861671480-1240094.log`; rerun on head 994e2f99:
  `verify leaf 994e2f99...: green`, receipt 55e160d5 (format 0, typecheck 0, test 0),
  `verify test: 0 .../check-test-1794861892773-2033248.log`.

## Done-criteria proof

All through `bun test tests/seat.test.ts` (green at 24ac34e0 and 994e2f99), plus hc-start:

- C1 pair-form merge (one flag, env kept, false→true): three "pair-form --settings" cases green.
- C2 equals-form merge: "for an equals-form --settings line" green.
- C3 no-settings append, position, exact value: "a claude line without --settings" green.
- C4 refusals (10 shapes, message names harness and operand): "harnessArgv refuses a claude line
  with $name" green.
- C5 unchanged elements/order, disallowed once last, other harnesses: in-test comparisons plus
  the two pre-existing template tests; launch-order proven again by hc-start's claude case after
  the stand-in fix.

## Red-run judgment

The verify run on 24ac34e0 logged two reds. `hc-start`'s claude launch had a real cause in the
leaf's diff (the appended `--settings` pair broke the stand-in parser; fixed at 994e2f99).
`next.test.ts` "new tab keeps existing scratch" had no plausible cause in the diff: retried green
in isolation (stale-tmp log) and green inside the full suite rerun on the same head
(test-full-1794861758692) — recorded `inconsistent`, not a product red.

## Workers

- u1 (brief-1.md, worktree ...-u1, removed): commit ad4aa294; seat-tests green, typecheck clean.
- u2 (brief-2.md, worktree ...-u2, removed): commit c2f485c1; docs-links green.

## Known limitations / unverified criteria

- Claude Code honoring the merged key is charting's stub-API proof (readiness.yaml proofs); no
  live or paid session ran in this leaf.
- A later Claude Code version that renames or drops the key is undetected by this leaf.
- No unverified criteria.
