# Implementation report: issue-flow-report

Base: `ed0a05d` (AKROGON_BASE; opening refresh found the branch already at `origin/main`, no rebase). Head: `9103caa`.
Mode: subagents, one wave, two workers (`issue-flow-report-u1`, `issue-flow-report-u2`), both worktrees removed.

## Changed files and reasons

- `src/pull.ts` — exported `originSource` (origin URL → `owner/repo`); `pullRepo` rewired, behavior unchanged (D8).
- `src/timing-report.ts` — `flowIssueSchema`/`parseFlowListing`, `flowReport` (carriers from `allLeaves` + `leavesUnder(issues/parked)`, one sorted `retryCommand` `state=all` listing per distinct repo, PRs dropped, carried rows, `not in listing`, uncarried open rows, four summary lines), `timingCommand` third union member (D1–D6, D9, D11).
- `src/akrogon.ts` — `flow` option, three-shape validation, locked usage line naming all forms (D7).
- `README.md` — timing row gains `--flow --since <YYYY-MM-DD>` alternative, effect covers the flow report (D10).
- `docs/guide/files.md` — `--flow` paragraph: leaf-carried coverage, handoff split, per-repo `state=all` listing, read-only (D10).
- `src/AREA.md` — `timing-report.ts` line mentions the flow report; file 38 lines.
- `tests/timing-report.test.ts` — planned tests committed at plan.synthesis (c7c9b42); A's correction c8d820e: `timing()` gained an `env` parameter and the three fake-gh flow cases pass `gh.env` — the planned tests reached the real `gh` login instead of the fake (worker-1 mismatch; every other `fakeGh` consumer passes `gh.env`); prettier reformat in 9103caa.
- `tests/command-reference.test.ts` — timing contract updated to the three-form usage plus the files-guide assertion (plan.synthesis commit).

## Commits

- `c7c9b42` test: plan the issue flow report cases red before product code (plan.synthesis)
- `c8d820e` test: flow report tests forward the fake gh environment (A's wiring correction, Test-Change trailer)
- `3585196` timing: add --flow issue lifecycle report (worker 1, cherry-picked 3b58498)
- `9bb554d` docs: akrogon timing --flow issue report (worker 2, cherry-picked 0f2eb00)
- `9103caa` style: prettier format the flow report files (verify format repair, Test-Change trailer)

## Worker returns

- U1 (`brief-1.md`, commit 3b58498): implemented the three product files; returned one mismatch — the planned tests never forwarded `gh.env`, so the fake gh was unreachable and the real `gh` 404'd on `acme/project`. A confirmed and fixed in c8d820e before the pick. After the fix the worker's replay of all flow scenarios passed 19/19 including exact stdout. Limitation noted: `oldest` floors the max age; committed tests bound it loosely.
- U2 (`brief-2.md`, commit 0f2eb00): three doc edits; `command-reference.test.ts` 6/6 green in its worktree. No mismatch.

## Proofs

- `akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/pull.test.ts tests/command-reference.test.ts'` on 9bb554d: 26 pass, 0 fail — covers C1 (exact carried-row block + sort + spans), C2 (parked-carried stays carried, uncarried lines), C3 (four summary lines, even-count median, `-` handling, `not in listing` in counts only), C4 (per-repo `args` pin, PR drop, `not in listing` exit 0, failed read retries once then non-zero with command+output), C5 (usage errors name all three forms; README contract; guide literals).
- Deliberate break (standing design): dropped the `pull_request` filter in `parseFlowListing` → `flow report: carried issues...` went red (`summary uncarried closed: 1` vs 0 — the fixture PR leaked into the closed count). Reverted; 26/26 green again.
- Criterion 4 real run in `/home/ivan/Work/infra/akrogon`: `bun <worktree>/src/akrogon.ts timing --flow --since 2026-10-01` exit 0 — 75 carried rows for `Tamdoma/akrogon#` issues (wait/total/leaves per row, all merged), 57 uncarried open rows across `Tamdoma/akrogon` and `Tamdoma/tamdoma-framework`, summaries `summary before: 35 merged 35 wait 0.0d total 0.1d`, `summary since: 40 merged 40 wait 0.0d total 0.3d`, `summary backlog: 57 median 5.0d oldest 15d`, `summary uncarried closed: 214`. The 5.0d backlog median sits beside the chart's hand-computed 4.9d.
- `akrogon verify` on head `9103caa`: format 0, test 833 pass / 0 fail (49 files, ~96 s), typecheck 0 → `verify leaf 9103caa: green`. Wall time ~2.5 min.

## Repairs this pass

- First `akrogon verify` red on format only (prettier drift in worker-1 code and the planned test file); fixed by `bunx prettier --write` in commit 9103caa, re-verify green. Test file touched → commit carries the Test-Change trailer.

## check.fix repair (2026-10-15)

B's check.review found F1 (foreign repos inflated the origin backlog — B repaired in c6b0826/43805b7 with a red-first reproduction test, plus docs e72ce50 covering my A-F1) and handed two test-scope items to A; opening refresh found the branch already at `origin/main` (base ed0a05d, head e72ce50).

- **B-F2** — missing even-count median case. Added `flow report: even counts average the middle two values for merged medians and the backlog` in `tests/timing-report.test.ts`: two merged issues (wait 3d/2d → `2.5d`, total 4.0d/3.5d → `3.8d`) and a two-issue origin backlog asserting the fixture-derived median and floored oldest. Deliberate break: `flowMedian` returning the lower middle value ran red (`wait 2.0d total 3.5d` vs expected `2.5d/3.8d`); reverted, test green. Commit d8190a7 with Test-Change trailer.
- **B-F3** — removed the literal `leaf-carried` prose assertion from `tests/command-reference.test.ts`; the command-literal assertion stays. Commit d29fe5b with Test-Change trailer.

Re-proof after repair: `akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/command-reference.test.ts'` on d29fe5b → 20 pass / 0 fail. `akrogon verify` on head d29fe5b → format 0, test 835 pass / 0 fail, typecheck 0 → `verify leaf d29fe5b: green` (~95 s).

The C3 proof claim in this report is corrected: even-count averaging is now covered by the d8190a7 case, not by the earlier since-total coincidence.

## Known limitations

- `not in listing` carried issues count in handoff groups but contribute nothing to medians (no filed time) — planned.
- Transferred issues appear under their current repository listing only — planned.
- `summary backlog` `oldest` floors the max age to whole days.

## Unverified criteria

- None. Criteria 1–5 proven by the `test` check plus the criterion-4 real run above.
