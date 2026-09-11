# Review A: status

Base: `33387facaaa93d38f2937d646f262233812cdf50`
Reviewed head: `333ce854da8798f06be1674bc9daa9ae4da42730`
Verdict: **fix**

This is the initial slot A review. No positions/rebuttals exist because debate was skipped. This session previously performed B's review, so this is not a claim of a blind independent reviewer. The head and worktree remain unchanged.

## Findings

### F1 — Fix: unreadable state silently omitted

Confirmed at `src/status.ts:43–51`. Traversal discovers state.yaml, then calls `leavesUnder`, whose `existsSync` check follows symlinks. A dangling state.yaml target therefore becomes an empty successful subtree instead of a read failure. This violates brief done-criterion 1 and plan D3/C3.

Additional real subprocess verification during A's pass: two temporary registered repos, one with a failed leaf whose state.yaml was replaced by a symlink to a missing file, and one with a readable leaf. Invoked `status` from outside either repo. Actual result:

```json
{"scenario":"unreadable state beside readable repo","code":0,"stdout":"good\n  issue\n    visible phase=implement done=[] attempts=A:0,B:0 fix_rounds=0 verdict=[] tab=unavailable blocked-by=[] age=unavailable\nrepo","stderr":""}
```

Expected: nonzero exit and the affected repo/state path before readable rows. The readable repo must remain visible. Fixtures were cleaned in finally. B's review includes the minimal reproduction command.

Repair by reading the discovered state directly through `readState`, preserving the path-aware error boundary, rather than entering recursive discovery again. Add the two-repo failing-state regression before the fix. Do not alter shared lifecycle routing or add a fallback.

### F2 — Fix: assertion contracts require cosmetic output details

Confirmed at `tests/status.test.ts:99–105`, `119–125` and the detail-output assertions. Exact strings such as `verdict=A:fix,B:nits` and `tab="w1:t9"` freeze slot ordering and quoting even though neither is an acceptance criterion. The human-readable row is not an executable format. The locked Command Tests decision explicitly rejects these tests as a maintainability defect.

Keep the existing end-to-end scenarios and exact semantic values. Parse existing YAML/JSON for detail assertions and tolerate cosmetic row spacing, optional quotes and slot ordering while preserving field/value associations. Do not weaken assertions to mere occurrence of numbers or add a new output API. Numeric age, repo/slug references, attention order, hierarchy, no writes and literal herdr arguments remain valid contracts.

## Verification and acceptance assessment

Reviewed the six-file implementation against plan D1–D7, C1–C6, the eight-section implementation brief, its exclusions and report. Status command wiring, recorded row fields, log-derived age, authoritative detail resolution, and the scoped failed-notification branch otherwise match the plan. Tests invoke real command processes against temporary repositories, substituting only herdr. No unrelated production changes or dependency additions were found.

Existing unchanged-head evidence remains applicable: formatting and typecheck passed, and `implementation/full-test.txt` records 30 passing tests with 314 assertions. No full-suite rerun was needed. A's additional F1 probe above exposes the gap in that passing suite. No production files were edited and no real herdr notification or GitHub operation was performed during review.

No additional fixes or nits. F1 and F2 retain the IDs used in review-B.md so the repair addresses each once. C7 is the operator's live takeover verification after merged, not this review's certification. The recorded intervention-timing and unlocked-read limitations remain explicit and do not add repair scope.

## Re-check after check.fix (round 1)

Prior reviewed head: `333ce854da8798f06be1674bc9daa9ae4da42730`
Repair head: `ab36dd0e424b5b5041dd251` (commit "Fix unreadable status state and semantic assertions")
Verdict: **ready**

Inspected only the repair diff: `src/status.ts` and `tests/status.test.ts`. No other files changed.

- F1 fixed. `walk` now calls `readState(folder)` directly when it finds `state.yaml` and returns the leaf itself, so a dangling symlink or a file removed after enumeration reaches `readFileSync` and is reported. Re-ran my dangling-symlink repro on the repair head: exit 1, diagnostic names repo `repo` and the state.yaml path with ENOENT. A fail-first regression for this case was added to the C3 scenario.
- N1 addressed. Row assertions now extract each field with a small `field` helper and compare parsed values, slot lists are sorted before comparison, detail output is parsed as YAML state and JSON records and compared to `readState` of the authoritative leaf. Diagnostics are parsed as JSON. No public output mode or parser abstraction was added.
- N2 unchanged and still plan-accepted.
- No defect introduced by the repair. The `field` regex ends a value at the next `name=` token, which no current value contains.

Verification on the repair head: `bun run format` exit 0 with no changes, `bun run typecheck` exit 0, `AKROGON_BASE=33387fac… bun test` 30 pass, 0 fail, 337 assertions. Live `bun src/akrogon.ts status` from the worktree exit 0 and shows this leaf at check.review. Repair evidence recorded under implementation/ (repair-1-red.txt, repair-1-green.txt, repair-1-typecheck.txt, repair-1-full-test.txt, repair-1-command-evidence.json).

## Merge

Fetched origin; `origin/main` at `33387fac` (unchanged since branch point), rebase was a no-op, head `ab36dd0e`. AKROGON_BASE refreshed from `akrogon config`: `33387fac`. Checks in worktree: `bun run format` exit 0 with no changes, `bun run typecheck` exit 0, `bun test` 30 pass, 0 fail, 337 assertions. No advisory commands configured. Pushed `HEAD:main` to origin fast-forward.
