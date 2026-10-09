# Review A: seat-a-replacement

Slot A, initial `check.review`. `debate: no`, so no positions or rebuttals; judged blind from brief, design, plan, report, and the diff.

- Base reviewed: `a2e9f9411d2639ec3841ef152c442b0bfe13778b` (`AKROGON_BASE`, also current merge-base of branch `seat-a-replacement` and `origin/main`)
- Head reviewed: `5cda354` (three commits: `566f7f4` fake herdr, `d685087` prod swap/restore, `5cda354` tests; tree clean)
- Diff: `src/next.ts` +42/-1, `src/shell.ts` +6/-1, `tests/fake-herdr.ts` +75/-8, `tests/next.test.ts` +348/-0

## Read against decisions and criteria

- D1 trigger: `repairB` binds only when `!bootstrap && recordedA === undefined && recordedB !== undefined`; every other branch keeps prior code with no swap and no focus call. Verified in `src/next.ts:426-469`.
- D2/D3 order: split B right (existing placement flags) -> intermediate `saveState` with the new A ID -> fresh `tab list` for `prev` -> one swap. Matches.
- D4: one `herdr pane swap --source-pane <B> --target-pane <newA>`, no retry helper. `changed:false` treated as failure (implementation note, conservative per C1).
- D5: `tab focus <prev>` attempted on both paths, skipped when `prev` undefined or the leaf tab; restore failure warns after a swap failure, throws after a swap success. Matches.
- D6: throw names `state.slug` plus herdr code/message via `herdrDetail`; no retry, no close; intermediate save keeps the new A recorded so a later pass takes `recordedA`-present (no second A, no swap). Matches.
- D8: `pane layout` appears only in `tests/`; prod never calls it.
- D9: `tabSchema` gains optional `focused`/`workspace_id`; swap result is a loose object requiring `changed`; tab-focus result is `z.object({})`. Extra fields from herdr 0.9.3 pass through.
- Probe (`layout-scope-probe.md` items 2,3,5,6) matches implementation: swap flips the focused tab to the source's tab, `tab focus <prev>` restores across workspaces, source=B keeps B as the tab's focused pane.

## AREA.md path check

`src/AREA.md` and `tests/AREA.md` name `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `docs/reference-index.md`, `tests/helpers.ts`, `tests/phase.test.ts`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`, `tests/watch-issues-scripts.test.ts`, `bunfig.toml`, `issues/config.yaml` — all exist from repo root (verified by listing). No documented behavior changed; no doc page edits needed per plan "Docs: none affected".

## Independent verification (this seat)

- `bun run typecheck` -> exit 0.
- `bun test --changed=$AKROGON_BASE --timeout=30000` -> 562 pass, 0 fail.
- `bun test tests/next.test.ts -t "missing A beside surviving B"` -> 1 pass (C1: `A.x + A.width <= B.x`, B ID/agent kept, exactly one split of B and one swap B->newA).
- `-t "restores operator tab focus"` -> 2 pass (C2: `tab focus <prev>` issued across workspaces; in-leaf-tab case stays with B as `focused_pane_id`).
- `-t "swap failure keeps"` -> 1 pass (C3: nonzero exit, skip names slug and `fixture_swap_failed`, one swap call, no close, recorded A kept, second pass creates no pane).
- `-t "allocation paths unchanged"` -> 4 pass (C4: new tab, bootstrap, B-only, present/reversed, extra-pane cases show no swap and no focus call; extra-pane missing-A still repairs).
- `bun test --timeout=30000` full suite -> 592 pass, 0 fail (~38 s). Report's 592 count confirmed.
- `bunx prettier --check` on the four changed files -> clean. `bun run format` itself is a write-mode check; its only delta is pre-existing `src/status.ts` drift present identically on base `a2e9f94` (verified by checking the base blob), untouched by this diff, so not a leaf defect.

## Findings

No Fixes. All C1-C4 proofs pass independently, the diff is minimal and matches D1-D6, and the fail-before evidence in `implementation/red-before.log` matches the reported pre-fix failure mode.

### Nits

- **N1 — non-schema warning line on `next` stderr.** `src/next.ts:453` `console.warn` emits `{"warning":"tab focus restore failed",...}` to stderr in the swap-failure-plus-restore-failure path; consumers like the test `skips()` helper parse every stderr line as a skip object, which would throw on this line. Deferred: no tested or observed path reaches it (requires `tab focus` itself to fail on top of a swap failure), and sibling warnings at `src/next.ts:842,855,999` already emit the same non-skip shape, so the pattern is house style. Promotes to a Fix if a real consumer parses `next` stderr strictly or a test ever exercises the double-failure path.
- **N2 — fake `pane split` ignores `--direction`.** The fake always splits right; a `--direction down` call would model incorrect geometry silently. Deferred: prod sends only `right` today and `pane layout` exists for assertions; promotes to a Fix if a `down` split is introduced or a test asserts vertical geometry.

## Operator actions

None.

## Verdict

`nits`
