# Implementation report: worker-test-duty

Base: a7c9115 (= origin/main at start; no rebase moved the branch)
Committed head: 419f930

## Changed files and reasons

- `skills/implement-issue/brief-template.md` — §7 names the unit's targeted test commands from A's plan and the none-named rule, no longer supplies the resolved `test_changed`/`AKROGON_BASE` (criterion 1); §2 refers to the commands §7 names (criterion 1 wording).
- `skills/implement-issue/worker-protocol.md` — targeted-test wording in Launch and return; workers run only brief-named targeted tests, never the full changed-tests command; A runs the resolved changed-tests command after each pick; repair sub-brief workers run the targeted tests their brief names (criterion 2).
- `skills/implement-issue/SKILL.md` — delegated run gives workers only their unit's targeted commands, never the full changed-tests command or A's criterion proof/`checks` runs (criterion 2); wait-on-exit item 3 names the mktemp/nohup/log/exit/pid background form with running-vs-incomplete semantics and never-`timeout`/never-second-start (criterion 3).
- `skills/check-issue/SKILL.md` — the checks-block paragraph carries the outside-run proof sentence (criterion 4).

Commits: e5ee5b3 (unit 1, cherry-picked from worker u1), 419f930 (unit 2, cherry-picked from worker u2). Both worker worktrees removed.

## Criterion proof

- Criterion 1: `git diff a7c9115..HEAD -- skills/implement-issue/brief-template.md` — §7 names targeted commands + none-named rule; no `test_changed`/`AKROGON_BASE` in §7. Result: pass (head 419f930).
- Criterion 2: `git diff a7c9115..HEAD -- skills/implement-issue/worker-protocol.md skills/implement-issue/SKILL.md` — workers never run the full changed-tests command; A runs it after each pick; `checks` belong to A and run at phase end ("final passing proof and `checks`"). Result: pass (head 419f930).
- Criterion 3: `git diff a7c9115..HEAD -- skills/implement-issue/SKILL.md` — wait-on-exit names mktemp dir created before launch, nohup whole-command, log/exit/pid, running-vs-incomplete semantics, never `timeout`, never a second start. Result: pass (head 419f930).
- Criterion 4: `git diff a7c9115..HEAD -- skills/check-issue/SKILL.md` — sentence present in the checks-block paragraph. Result: pass (head 419f930).
- Criterion 5: `test` check — see comparison record (inconsistent → green on retry).

## Commands run and results

- `akrogon run-check --name 'format' ...` — green; prettier rewrote nothing (seconds).
- `akrogon run-check --name 'typecheck' ...` — green (seconds).
- `akrogon run-check --name 'test_changed' ...` — green after each cherry-pick; "no test files are affected", 0 tests selected (seconds).
- `akrogon run-check --name 'test' ...` at base a7c9115 (planning pass) — first run red, 8 timing-test timeouts under host load; retry green, 889/0 (minutes: 270.88s then 162.09s). Record: implementation/compare-test.yaml, logs test-check-first-run.log, test-check-retry.log.
- `akrogon run-check --name 'test' ...` at head 419f930 (this pass) — first run red, 35 timing-test timeouts under host load; retry green, 889/0 (minutes: 454.37s then 206.65s). Record: implementation/compare-test-head.yaml, logs test-check-head-first-run.log, test-check-head-retry.log.
- Workers' targeted runs `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` — 20 pass / 1 fail in both worker worktrees: `tests/base-run.test.ts` "a run killed during setup leaves a record with start and no end or removal" timed out standalone at 5000ms. Reproduced identically on the clean lane at base a7c9115 (pre-existing, no cause in the leaf diff: the test kills the run at ~6.1s and passes only under the suite's `--timeout=30000`). The `test` check covers this file and is green.

## Known limitations

- Standalone `bun test tests/base-run.test.ts` is red at base (timeout vs kill-time defect); a whole-suite run under `--timeout=30000` is green. Known-red on base; not caused by or fixable within this leaf's owned surfaces.
- The `test` check's herdr/dispatch timing tests are load-sensitive; two inconsistent first runs were observed under concurrent leaf load on this host. The check itself is green on retry.

## Unverified criteria

None.

## check.fix repair — F1

Before commits: e5ee5b3, 419f930 (reviewed head 419f930). After commit: d9ab236.

- Plan corrected first: `plan.md` gained a `Plan corrections` entry — missing step was the singular `changed-test` grep form; corrected rule with executable check `grep -rniE 'changed[- ]tests?' docs/ skills/ README.md`.
- Repair commit d9ab236: `skills/AREA.md` "changed-test evidence" → "targeted-test evidence"; `implement-issue/SKILL.md` Standalone "derive changed-test commands" → "derive the brief's targeted test commands" and "changed-test evidence" → "targeted-test evidence". Executable check rerun: every remaining hit is the new rule itself or A-duty/config wording.
- `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` at d9ab236: 20 pass / 1 fail — the known pre-existing standalone `base-run` timeout recorded under Known limitations.

`test` check at d9ab236: first run red, 178 timeout fails in 982s under a saturated run-permit queue (implementation/test-check-fix-first-run.log); retry red, 222 timeout fails in 1453s (implementation/test-check-fix-retry.log); `akrogon base-run --base a7c9115 -- <same command>` launched (log pending, see below).

Base-run comparison (check.fix): `akrogon base-run --base a7c9115 -- <same test command>` → exit 1, 367 pass / 522 fail, 3333.76s, log implementation/base-b2249ebc-7744-4506-972d-b247c99a95b8.log. Record: implementation/compare-test-fix.yaml — 157 units `known-red` (fail on both leaf runs and base), 372 `inconsistent` (fail in only one of the three runs), zero `new`, zero `unverified` from leaf-diff causes; all fails are bun-test timeouts under host load average ~130-175; the leaf diff is markdown-only with no plausible cause. Passed to `akrogon phase` via `--compare`.

Phase move: `akrogon phase worker-test-duty check.review --slot A --compare implementation/compare-test-fix.yaml` → `moved check.review` (state.yaml phase=check.review; 157 known-red entries opened in issues/red-records.jsonl; the command's notice delivery is its own machinery). The compare record uses the `compared` schema: 157 known-red units only; 372 units failing in just one of the three runs are inconsistent and not admissible under the validator — noted, not claimed.

## check.fix round 2 — F2 verification repair

F2 (B re-check of d9ab236): criterion 5 lacked a green `test` run at the repaired head and the compared record omitted units failing in only one run.

- `akrogon run-check --name 'test' ...` at d9ab236: green, 889 pass / 0 fail, 9044 expectations, 187.84s — implementation/test-check-fix2-green.log. Criterion 5 passes at the repaired head; no `--compare` is needed on this move since no failing units remain.
- `akrogon run-check --name 'format'` — green, no rewrites. `akrogon run-check --name 'typecheck'` — green. `akrogon run-check --name 'test_changed'` — green, 5 changed files, no test files affected.
- Evidence correction: compare-test-fix.yaml retains its 157 known-red units as the record of the two earlier red runs; the 372 units that failed in only one of the three runs were never claimed known-red — their inconsistency is now moot under the green head run. Both earlier red logs and the base-run log stay in this folder as the raw record of all three runs.
