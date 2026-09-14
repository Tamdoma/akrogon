# Implementation brief: command-deletions-batch

## 1. Goal

Land the eight deletion/replacement groups from `plan.md` (D1–D10): unknown panes wait like busy ones, `failed` exits by `akrogon phase`, merge auto-recovery and the per-repo lock/`max_active` are deleted, an empty leaf branch is refused at review handoff, a debate gate guards `plan.synthesis`, a typed `next` in a leaf pane sweeps the repo, and the guide drops lines describing deleted machinery.

## 2. Acceptance criteria

The eleven done-criteria in `brief.md`, unchanged. The grep criteria (1, 8) and the behavioral tests (2–7, 9) are the contract; criterion 11 is the tee'd full-suite artifact.

## 3. Read-first list

`plan.md` (decisions D1–D10 and the ordered checklist), `src/next.ts`, `src/phase.ts`, `src/routing.ts`, `src/state.ts`, `src/config.ts`, `src/pull.ts`, `src/sync.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/fake-gh.ts`, and this skill folder's `ponytail.md`.

## 4. Units

- `brief-1.md` — test deletions, rewrites and new cases (red vs old code).
- `brief-2.md` — `src/` changes (green).
- `brief-3.md` — `docs/guide/` line edits.

## 5. Do-not

No scope beyond plan.md. No new abstractions, no fallback logic, no renaming beyond what a decision names. `debate` key, `withLock`, `busy` notice timing, `PROMPT_GRACE_MS`, `STALL_MS`, `park`, `hand_built`, log schema, `src/init.ts`, `tests/fake-gh.ts` are untouched.

## 6. Order

brief-1 → brief-2 → brief-3, then B runs format, typecheck, the full suite tee'd to `/tmp/akrogon-command-deletions-batch-test.log`, and the two done-criterion-1 greps.

## 7. Commands

Workers: `bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` with `AKROGON_BASE` set. brief-3 uses the done-criterion-1 greps instead.

## 8. Done-when

All checks green, artifact at `/tmp/akrogon-command-deletions-batch-test.log`, report filled below.

Changed files and reasons: `src/routing.ts` (failed.next), `src/config.ts` (repoSchema, effectiveConfig), `src/state.ts` (withRepoLock deleted), `src/phase.ts` (commitMove, requireCodeOnly, recoverMerge deleted, single lock), `src/pull.ts` (unlocked), `src/sync.ts` (single lock, guarded lockPaths), `src/next.ts` (busy+unknown, seatFor/peerOf/stand-in deleted, merge-seat block and recoverMerge call deleted, debate gate, activeCount→number, hooked=event!==undefined); `tests/next.test.ts`, `tests/phase.test.ts`, `tests/sync.test.ts`, `tests/config.test.ts`, `tests/pull.test.ts` rewritten per D9 plus repair brief-4; `tests/fetch-deadline-harness.ts` deleted (D10); `docs/guide/{phases,problems,next,setup,cheat,in-practice,install,limits}.html` per D8.
Tests run: `bun run format` clean; `bun run typecheck` clean; `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/akrogon-command-deletions-batch-test.log'` → 217 pass, 0 fail, 12 files, 96.45s; artifact at `/tmp/akrogon-command-deletions-batch-test.log`. Greps: `seatFor|peerOf|recoverMerge|withRepoLock|issues/.lock|repo_max_active|perRepo` in src/ empty; `stand-in|other agent's pane|other pane` in docs/guide/ empty; `issues/.lock` in tests/ and src/ empty. Red→green evidence in report-1.md (14 red) and report-4.md (0 fail).
Known limitations: overlapping `akrogon pull` runs no longer serialize (accepted, design 4a); merge re-prompt after push relies on merge-skill idempotence. Worker note: tests/next.test.ts was truncated mid-work by a worker and restored by replaying the earlier worker's recorded edits; verified by the green suite.
Unverified criteria: none
