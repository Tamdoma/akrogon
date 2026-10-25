# Implementation report: member-receipts

## Refresh

Rebased the leaf branch onto `origin/main` before delegating: prior base `68f1b19d`, prior head `83dadf3` (the planning-time test commit); new base `f89afbff`, new head `411ae35`. `src/verify.ts` and `src/flaky.ts` were untouched by those 23 commits; the suite-refusal leaf landed on `run-check.ts` and sibling skill files without conflict. Fetch/rebase produced no conflicts.

## Mode

`implement: subagents`, one wave of two units (disjoint paths, no shared test resource).

- Worker u1 (`/home/ivan/.akrogon/worktrees/akrogon/member-receipts-u1`): commit `d6b976e`, cherry-picked as `fbac86c6`.
- Worker u2 (`/home/ivan/.akrogon/worktrees/akrogon/member-receipts-u2`): commit `6d38286`, cherry-picked as `248dfd8e`.
- Worker worktrees removed after the picks.

## Changed files and reasons

- `src/verify.ts` — all member-receipts behavior: `reused` optional field on receipt entries; `reuseSource`/`greenEntry` per-command reuse keyed on tree+scope+name+command from completed runs (a source whose log file is gone reruns instead of lending a dead pointer); `runOnce` split into sequential `checks` then concurrent `merge_checks` under `Promise.allSettled`, with blocked members recorded at the blocker's exit and log and a member rejection rethrown after all settle so `end` stays unset; per-command `requireGreenReceipt` and `knownRedReceipt` (base `exit === 0` never covers); `newRedUnits` ignores `reused` entries on both sides; `--known-red` verdict now from `knownRedReceipt` over the whole ledger; `baseCoversHead` removed.
- `src/flaky.ts` — `flips` skips entries carrying `reused`.
- `tests/verify.test.ts` — 13 planned criterion tests (committed at planning, red first); one expectation corrected by A in `6f36025`: the concurrency test compared two log contents where the sibling test compares log paths; `Test-Change` trailer carried.
- `tests/flaky.test.ts` — reused-entry flip case plus optional `reused` on the step builder.
- `skills/{merge-issue,check-issue,implement-issue,chart-issues}/SKILL.md`, `docs/reference/{checks,commands,config,files}.md`, `docs/use/merge-and-announce.md`, `src/AREA.md`, `tests/AREA.md` — per-command reuse, concurrent `merge_checks` after a green `checks` stage, base-side green reuse under `--known-red`.
- `411ae35` style-only prettier pass on `src/verify.ts`.

## Proof results

| Command | Commit | Result | Log |
|---|---|---|---|
| `bun test tests/verify.test.ts tests/flaky.test.ts --timeout=30000` (criteria 1–13) | `411ae35` | 50 pass 0 fail, 6.2 s | `check member-receipts-criterion-tests: 0 implementation/check-member-receipts-criterion-tests-1792880435921-1187646.log` |
| criterion-14 docs grep + `bun test tests/docs-links.test.ts` | `248dfd8e` | exit 0 | `check member-receipts-docs: 0 implementation/check-member-receipts-docs-1792880456469-1196925.log` (first wording run red on `reus`→`reuse` pattern, pattern corrected, same assertion) |
| `checks` format | `411ae35` | exit 0 | `check format: 0 implementation/check-format-1792880467316-1197249.log` (first run red: prettier drift in `src/verify.ts`, fixed by `411ae35`) |
| `checks` typecheck | `411ae35` | exit 0 | `check typecheck: 0 implementation/check-typecheck-1792880471995-1197430.log` |
| `checks` test | `411ae35` | exit 0, 1159 pass 0 fail, wall 226 s | `check test: 0 implementation/check-test-1792880831934-1533373.log` |
| `akrogon verify` | `411ae35` | `verify leaf 411ae35...: green`, wall ~190 s | receipt in `issues/verify-runs.jsonl`; logs `check-test-1792881026009-2184753.log`, `check-typecheck-1792881028352-2184753.log` |

## Known limitations

- A green entry whose log was packed into `evidence.tar.zst` or deleted reruns instead of reusing — extra work, never a wrong reuse (worker-recorded, inherent to the `existsSync` source check).
- An all-reused run still pays setup and the fresh checkout; receipt still written. Same-tree assumption unchanged: host state, env and time sit outside the reuse key.
- `docs/examples`, `docs/reference/words.md` and `docs/pictures/verification.svg` keep "every check" phrasing; not in the plan's doc list.

## Unverified criteria

None. Criteria 1–13 green in the criterion run above; criterion 14 green in the docs run.

Base: `f89afbff` (origin/main at implementation). Committed head: `15a82fd`, an empty trailer-only commit on top of verified `411ae35` (same tree; the leaf receipt covers it).

## 2026-10-25 check.fix (slot A, head 3bdc243)

Review findings landed as B's repair (d2ff6795..666b1c0f): `blocked` entries excluded from known-red cover and flaky/notice observations, `existsSync` reuse gate removed (packed evidence reuses), `greenRun`/`redRun` scoped. B handed two test-expectation corrections to A.

Corrections, committed `3bdc243`:

- The linked-pair test dropped its vestigial `greenReceipt` on the merge-base — under per-command reuse the base run would borrow that green instead of observing the real red the pair record needs.
- The incident-resolution test pushes a main commit and verifies from a second leaf worktree so the second base run is fresh red on an unseeded merge-base; the seeded green still resolves the earlier incident only.

Targeted reruns, both green:
`check fix-a1-a2-b: 0 implementation/check-fix-a1-a2-b-1792882200036-3863470.log`

Planned criterion command reruns green (53 pass, 0 fail):
`check fix-criterion-tests: 0 implementation/check-fix-criterion-tests-1792882209319-3868091.log`

`akrogon verify` on `3bdc243` green (format/test/typecheck all 0, 1162 tests):
`check format: 0 implementation/check-format-1792882217524-3891983.log`, `check test: 0 implementation/check-test-1792882451585-3891983.log`, `check typecheck: 0 implementation/check-typecheck-1792882454020-3891983.log`
