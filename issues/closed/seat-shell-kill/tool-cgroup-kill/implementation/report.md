# Implementation result: tool-cgroup-kill

Mode: subagents, three waves — W1 {U1 kill machinery, U3 recovered shell} in parallel, W2 {U2 seat wiring} (serial after U1 since both own `src/tool-cgroup.ts`), W3 {U4 docs}. Implemented on the leaf worktree branch `tool-cgroup-kill`, rebased onto current `origin/main` (`64681915`, which advanced during implementation), committed head `8015eeff0f2ced10f6b58e00a20c686b3eade3ac` (19 leaf commits over the base, including the planning-era red tests `a2dd5838`).

## What landed, per wave

- U1 `db7f7e02` — `src/tool-cgroup.ts` (entry script template and atomic refresh, relocation, commit-move sweep, deferred-kill helper), `src/phase.ts` (sweep in `commitMove`'s finally), `src/akrogon.ts` (relocation after parseArgs / at checkedRun entry, hidden `tool-kill-helper` verb before migration), `src/run-check.ts` (EPIPE-tolerant echoes), timing kinds `tool_kill`/`tool_kill_deferred`.
- U3 `b1497db5` — `recoveredShellSeat` in `src/next.ts` inside the lost branch only; schema fields `argv`/`reason`/`foreground.name` in `src/hc.ts`.
- U2 `26d36b91` — `src/seat.ts` wiring: entry refresh per start, `Delegate=yes`, `AKROGON_SEAT_CGROUP`, per-kind wiring (claude wrapper shell + tool-memory-limit off, pi/codex BASH_ENV, agy PATH-first), three-outcome `scopeEntry` probe, bootstrap of `tools/`/`akrogon/`/`helpers/`, fake-mode skip.
- U4 `c81b8f1a` — `src/AREA.md` and `docs/reference/files.md` updated for all of the above.

## Corrections A made after worker returns (all with cited sources)

- `2e6c31d6`, `751cb9ef`, `3ef78af4`, `6318b00e` — worker-reported test mismatches corrected with `Test-Change:` trailers, each citing the source file/line or the brief line the old expectation contradicted.
- `edb47dde`, `fbfc2db9`, `7c505a87` — planning-era corrections to self-contradicting tests, committed before the first wave.
- `ad88f440`, `63243bc8` — typecheck-driven typing corrections in the proof tests (labels passed to the predicate instead of `expect`; stream narrowing in the capture helper), behavior unchanged.
- `78367c2c` — `Seen.argv`/`reason`/`foreground.name` made optional because the design's absent-reads-no-match line contradicts strictness that broke pre-existing synthetic fixtures (`tests/store-sweep-safety.test.ts`); the predicate treats absence as no match.
- `a656fd66` — real defect found in verify: the agy wiring assigned `PATH=<entry>:<akrogon process PATH>`, which replaced the terminal-inherited PATH, so the fixture's stand-in harness no longer resolved and two `hc-delivery` agy tests failed (`an unavailable first agy task waits…`, `an agy seat answers the trust dialog…`). Reproduced: the real agy binary launched inside the test scope instead of the stand-in. Repaired by running the agy harness through `sh -c 'export PATH=<quoted entry>:$PATH; exec "$0" "$@"'`, which prepends inside the terminal's environment. The criterion proof's assertions still verify: argv carries `PATH=<entry>` first, claude carries no BASH_ENV, pi/codex carry BASH_ENV (check-final4-tool-entry, exit 0). `tests/hc-delivery.test.ts` green on run-check after the repair (check-retry2-hc-delivery, exit 0).
- `b12ebf1b` — `tests/timing.test.ts` expected 3 timing-append warnings per move; the move now appends a fourth row, the sweep's `tool_kill` row for the legitimately enumerated seat scope (hcFixture seats run in real systemd scopes; evidence row `{"kind":"tool_kill",...,"seen":0}` recorded). Correction committed with `Test-Change:` trailer citing the brief.
- `8015eeff` — the proof's agy PATH assertion strips the shell quoting the wrapper needs; intent (entry dir first on the harness PATH) unchanged.
- `50d15feb` — prettier formatting of U1's files, whitespace only.

## Proof results (commands, commits, results)

- Criterion 1/2/4 `bun test tests/tool-kill.test.ts --timeout=120000` via run-check: red at `a2dd5838` (check-tool-kill-red4), green at head `8015eeff` (check-head-tool-kill-1795607241843, exit 0; 3 pass, 58 assertions).
- Criterion 3 `bun test tests/tool-entry.test.ts --timeout=120000` via run-check: red at `a2dd5838` (check-tool-entry-red3), green at `8015eeff` (check-final4-tool-entry-1795607069535, exit 0).
- Criterion 5 `bun test tests/recovered-seat.test.ts --timeout=120000` via run-check: red at `a2dd5838` (check-recovered-red), green at `8015eeff` (check-head-recovered-1795607243255, exit 0).
- `akrogon verify` on the committed head `8015eeff`: green — format exit 0, typecheck exit 0, test exit 0 (full suite, 1473 tests incl. changed-file rerun-each). Receipt rows in `implementation/check-{format,typecheck,test}-1795607…-4067486.log`. Wall time ≈ 19 minutes including earlier verify runs; the green verify itself ran ≈ 2.4 minutes of suite after format/typecheck. An earlier verify at `78367c2c` was red in test (the two agy regressions plus the timing expectation) — all three causes repaired or corrected above, rerun green.

## Refresh record

- Prior base `ce0cbbd8`, new base `64681915` (advanced during implementation); prior head `a2dd5838`-lineage, new head after rebase then waves `8015eeff`. Rebase replayed cleanly, no conflicts.

## Budgets

No paid sessions: the readiness-recorded claude and codex entries are mechanical launches and were never exercised by the free proofs (the proofs assert the launch wiring through the hc shim and real systemd scopes, per plan).

## Known limitations

- The agy PATH wiring deviates in means (not result) from the plan's `env` assignment wording, since env assignments cannot self-reference and `systemd-run` expansion is client-side; the design intent — entry dir first on the harness's own PATH — is what the proof asserts. Recorded under `## Implementation notes` in plan.md.
- cgroup.kill is asynchronous; the sweep's rmdir is best-effort and zombie-pinned cgroups converge over later commits, per the design's pinned-cgroup exclusion. The proofs assert process death and populated-0, exactly as planned.
- The fake-harness fixture path (`fixture()`) keeps the pre-existing scope-invariant refusal, per D5's fake-mode exception; criterion 3 covers it explicitly.

No unverified criteria: all five are green at the committed head.

## 2026-11-25 check.fix pass — repair of handed findings F1, F2, F4, F5

Input: review-B's `Handed to A` — F1 (silent rmdir failures), F2 (EAGAIN truncation on undrained pipes), F4 (rollback-empty timing history), F5 (entry internals traced into stderr). B repaired F3 itself in `958e0a53`. Slot A's review F1 duplicates B's F1; N1 is superseded by F2's repair, N2 stays a Nit.

Reproduction tests first, red on the head `a08e388d`'s parent state: the populated-0 removal warns test (red: zero warnings), the undrained-pipe test (red: EAGAIN exit 1 in ~100 ms), the sibling-ledger test (red: rows in timings.jsonl), the trace byte-identity cases (red: entry internals traced). Committed in `a08e388d` with `Test-Change` trailers citing review-B's probe logs.

Worker mismatch corrections, each with cited evidence:
- `d68b053e` — trace cases moved to a PID-free script (U5's proof that `$$` in a traced command makes byte-identity impossible across invocations); the corrected cases re-shown red on unfixed code before relaunch; kill-timings ts literal corrected to full ISO datetime (U7's zod evidence); timing.test.ts count corrected 4 to 3 (the sweep row now appends to its own writable sibling ledger).
- `f6db973d` — the wrapper trace comparison skips the caller's own exec line (U5's bash-probe evidence: the first traced line names the exec target, fixed by the caller's command text before the wiring runs).
- `80210ebe` — rows() reads kill rows from the sibling ledger (source: commit 28fd9756, the repair itself).

Repairs (one wave of three workers, disjoint owned paths — F1+F5 shared `src/tool-cgroup.ts` so they formed one unit):
- `7d5fa6c3` (U5) — rmdir failures warn and count exactly when the cgroup reads populated 0 (no reaping race), silent on populated 1 and ENOENT; both entry forms run their whole body inside a redirected brace group so nothing leaks into traced stderr, the wrapper restoring inherited xtrace through the exec argv.
- `6e2952f0` (U6) — `writeSwallowingEpipe` retries EAGAIN with `Bun.sleepSync(1)`; EPIPE swallowed, other errnos throw.
- `28fd9756` (U7) — `appendTiming` routes kill kinds into `issues/timings-kill.jsonl` (no caller changes); `readTimings` per-line tolerant with wakeRow's skip pattern; `docs/reference/files.md` documents the sibling ledger.
- `ce4bfb50` — `src/AREA.md` names the removal-warning gate and the trace silence.

Proof results after repair, all on the committed head `ce4bfb50` lineage:
- `akrogon run-check --name fix-tool-kill` exit 0 (check-fix-tool-kill-1795618002668): all of tests/tool-kill.test.ts green — criteria 1, 2 (both writer cases), 4 and the new F1/F2 reproductions plus B's ordering test.
- `akrogon run-check --name fix-tool-entry` exit 0 (check-fix-tool-entry-1795618006992): criterion 3 green including the trace cases.
- `akrogon run-check --name fix-timing` exit 0 (check-fix-timing-1795618016943): F4 reproduction and timing.test.ts green.
- Criterion 5's inputs (`src/hc.ts`, `src/next.ts` and its own file) unchanged since its green run at `8015eeff` — carried per the implement-end rerun rule.
- `akrogon verify` at `ce4bfb50` exit 0: format 0, typecheck 0, test 0 (full suite green). Receipt rows in implementation/check-{format,typecheck,test}-1795618…-1095744.log. Wall time ≈ 2.5 minutes for the suite.

Model-choice readings recorded in plan.md `## Implementation notes` (2026-11-25 check.fix A): the F1 populated-0 reading of "a rmdir failure warns" and the F4 sibling-ledger shape.
