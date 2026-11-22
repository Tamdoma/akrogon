# Implementation report: keep-red-run-temp

Serial-solo run (plan.md: one unit, subagents config but every wave holds one unit — A implemented directly, no workers, no sub-briefs).

Base: 5daa962e1c4ef03a80f0209a5c5520145f57ab61 (`akrogon config` AKROGON_BASE; refresh rebases were no-ops — branch stayed current)
Committed head: 4defba1e7d8ef20df3b2ce6b039fd598b33ea0fc (after check.fix round 1; prior reviewed head 96589baf, repair commits ad90984f by B and 4defba1e by A)

## Changed files and reasons

- `src/run-check.ts` — `checkedRun`: `keepRunRoot` local set to `result.code !== 0` as the last statement before the successful return (after `check_end`); the outer `finally`, still under `!refused`, writes an empty `.akrogon-kept` when the flag holds and `existsSync(runRoot)`, else `rmSync`s as before. Refusals (`refused` flag + throw before the flag set), thrown errors and zero exits never mark; a child that deleted `$TMPDIR` leaves no root to mark.
- `src/reconcile.ts` — scratch run-root loop: `existsSync(runRoot/.akrogon-kept)` → `continue` with no keep/drop, placed after the `refusal.json` check and before the `.owner` read; `ownerKeeps`: early `return []` for a `run-*` dir holding `.akrogon-kept`, before the `.owner` computation, no recursion.
- `docs/reference/checks.md` — private-`TMPDIR` sentence: red run's TMPDIR kept marked `.akrogon-kept` until the leaf temp is released, a `--holder` run's until the idle sweep; zero exits, refusals and throws removed as before.
- `src/AREA.md` — run-check line and reconcile line state the same lifetimes and the silent skip.
- `tests/run-check.test.ts`, `tests/verify.test.ts`, `tests/reconcile.test.ts` — planned cases and retargeted expectations from planning (0702dc70), plus two A corrections below (5c983c83) and prettier reflow (96589baf).

## Test corrections during implement (first exception, wrong expectations)

- run-check red-keep test: `scratchRuns` scans depth 2 (`<root>/<entry>/run-*`) but run roots live at `<leaf-temp>/<repo-hash>/<leaf-hash>/run-*` (depth 3) — observed `.../leaf-temp/79ff/6eb8d435/run-nCpDIs` in `check-c1-run-check-proofs-1795174089253-3793748.log`; replaced with the `*/*/run-*` glob the verify test uses.
- reconcile marked-root test: `next --all` re-dispatches the unfinished leaf and reopens its tab (shim log showed a new `run` for `marked-leaf` with a fresh `herdr.tab`; temp survived silently, no kept entry — the live-tab rule, not a defect); the release half now triggers the pass via a targeted dispatch of another leaf, matching the sibling test.

## Commands run and results

All criterion proofs run `akrogon run-check --name <label> -- bun test --timeout=30000 <file> -t '<pattern>'` from the leaf worktree; logs under `implementation/`.

- C1 (run-check red keeps marked root readable; green leaves none; refused keeps root without marker): `check c1-run-check-proofs: 0 implementation/check-c1-run-check-proofs-1795174107667-3797951.log` — 4 pass (red-keep, removed-on-success, deleted-TMPDIR, refused-no-marker), on head 5c983c83+product staged, pre-commit.
- C2 (verify red keeps TMPDIR marked, green removes): `check c2-verify-proof: 0 implementation/check-c2-verify-proof-1795174111059-3798655.log` — includes `gone` member exit 5 for the C5 verify half.
- C3 (marked root silent keep + release with leaf temp; dead and live `.owner`): `check c3-c4-reconcile-proofs: 0 implementation/check-c3-c4-reconcile-proofs-1795174264540-3862751.log` — also C4 (`run in progress` reason).
- C5 (deleted-$TMPDIR keeps exit, no root): covered by the `deleted its own TMPDIR` test in the C1 run and the `gone` member in the C2 run, both green.
- C6 (doc lines): `grep -n 'akrogon-kept\|TMPDIR' docs/reference/checks.md src/AREA.md` — present at checks.md:50, src/AREA.md:5 and :22.
- `akrogon verify` on committed head 96589baf: **green** — format 0, typecheck 0, test 0 (`check-test-1795174359560-3870405.log`, 1230 pass / 0 fail). One earlier verify pass was red only on prettier drift in the new test text; fixed by reflow (96589baf), no rerun of criterion proofs needed (assertion text unchanged).

Planning-stage red records are in `plan.md` (each new case shown red on base; Edit A and Edit B violation sims shown red, both reverted before commit).

## Grants, env

`readiness.yaml` has no grants/produces/inputs; `akrogon status` showed no `Missing:` lines. No paid or live launches: every run is a local `bun test` under kept `run-check` logs — no count lines owed. Wall times: each proof run seconds; the verify suite run ~60 s.

## Known limitations

- A killed wrapper (SIGKILL, seat timeout) still loses its run root — locked exclusion.
- `--holder` (`checkout`) marked roots go with the existing idle `dropUnowned` sweep; no timer.
- Both LESSONS.md lines stay per the design's Retire reading; rewording is `/learn-issues` work.
- Held disagreements in design.md (C's 2b/3b/4b and the chmod guard) remain unanswered standing dissent, not defects.

No unverified criteria, no model-choice readings, no proof-command corrections.

## check.fix round 1 (2026-11-20)

Review findings: A and B both filed F1 (doc misstates refusal lifetime); B filed F2 (C5 run-check assertion can't see a leftover root). B repaired F1 in ad90984f (docs rewritten: refusal keeps `refusal.json`/`out.log`, surviving red TMPDIR marked). F2 handed to A as a test-expectation correction.

- F2 repair (4defba1e): the C5 run-check case's `scratchRuns` scan misses `run-*` at depth 3; replaced with the `*/*/run-*` glob, red under a deliberate break recreating the root after `rmSync` while preserving exit 7 (`check-c5-gone-break-1795174734664-113446.log`, Expected [] / Received [run-*]), green after revert (`check-c5-gone-green-1795174742021-115984.log`). Cited finding: review-B.md F2.
- Reruns after repair: `check c1-run-check-proofs: 0 implementation/check-c1-run-check-proofs-1795174744959-116576.log` (the changed test file's four C1/C5 cases); `akrogon verify` on head 4defba1e green — `check-test-1795174810792-117453.log`, 1230 pass / 0 fail, format and typecheck 0. C2/C3/C4 proofs stand: their test files, proof commands and inputs unchanged since their greens; B's doc repair changed no test inputs.
- Refresh after repair: `git rebase origin/main` — already up to date, base unchanged.
