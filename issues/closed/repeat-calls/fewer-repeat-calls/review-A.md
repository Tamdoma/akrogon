# Review A — fewer-repeat-calls

Base `a4fc68d3`, reviewed head `232f5d5` (7 commits). Worktree clean, head ahead of base.

## Verification evidence

- Full diff read: `src/{scope,config,preflight,pull,next,self-update}.ts` and all changed `tests/` files.
- Traced the concurrency-sensitive paths in `src/next.ts`: `live`/`view` re-list after `closed` before `matches`/`members`; `wrote` covers `pane close`/`tab create`/`pane split`/`pane swap`, so `sight` exists only on write-free allocations; `seen` reaches `dispatchSlot` only into the `ownsTab` check, whose inputs (tab ids, pane→tab membership, workspace/worktree attrs) `agent start`/`agent prompt` do not mutate; `observeBusy`'s `notified` propagates correctly through `dispatchLeaf` (`listed = undefined`), `dispatchSlot` and `recordDelivery`; merged/failed phases return before `allocate` so `listed` is never stale there; `box`/`sweep` read `paneShell` once and the adoption poll is /proc-only with the changed-start refusal.
- `remoteBase`'s only caller is `checkBase`, which always runs `ensureRemote` first; `CommandError.result` preserves the `Result` into `PreflightError C1` unchanged. `commonDirectory` memoizes non-null only and evicts failures — matches the 2026-10-26 correction. `self-update` loses only the dead read; `preLocal` keeps the decision's one read.
- Tests: committed assertions cover criteria 1–3 at the real CLI boundary (fake herdr `.calls`, git shim `cwd|argv` log, `busctl.restime` trigger); fail-before/pass-after recorded in plan.md red-first runs and the u2 worker's partial-red log that turned green after the u4 pick.
- `akrogon verify` green at head (receipts in `implementation/check-test-*.log`, `check-typecheck-*.log`, `verify leaf …: green`); `implement-dispatch` 293 pass 0 fail; format/typecheck 0.
- Re-entering durations from kept logs: slowest head 7089.02 ms < slowest base 11257.63 ms.
- AREA.md: the changed `tests/AREA.md` names only existing paths; no `docs/` page or command reference describes the removed reads — no documented behavior changed; the `isolation.ts` line was updated per plan D8.
- `git status --porcelain` empty; `232f5d5` prettier diff is line-wrapping only, matching its `Test-Change` trailers.

## Findings

### Fix 1 — criterion 4's fake-herdr base is the wrong form, and the both-commits dump is not recorded

On the base commit the fake herdr already runs as the preload bytecode bundle, so the criterion's "one fake herdr call takes less time than on the base" must compare base-bundle vs head-bundle (plan D7 says exactly that). The report timed `bun tests/fake-herdr.ts` — the source form no base caller uses — against the head bundle. The `shellPid`/`expectedSlice` output dump compared on both commits, which the criterion names ("compared on both commits and recorded"), appears only as a worker report line, not a recorded command and output. Source: the measurement commands in `implementation/report.md` and `$TMPDIR/proof4` usage described there. Consequence today: the CryptoHasher delta inside the bundle is unproven — bundle-vs-bundle could show no gain or a regression and nothing in the report would say. Repair: bundle `tests/fake-herdr.ts` at `a4fc68d3`, run the timed-call loop on both bundles, and record the dump diff.

### Fix 2 — criterion 5's planned proof shape was not run, start load never recorded, three-at-once counts absent

Plan D7 names a pair as two checkouts of the same side ("10 head pairs alternate with 10 base pairs"), start load per pair from `uptime`, and keeps Proof 2a's "three-at-once recorded counts". The pass ran 10 mixed base-vs-head pairs, recorded walls/exits only, ran no three-at-once recording, and `implementation/report.md` records no proof-command correction. Source: `implementation/proof-c5.txt` and the report's measurement section. Consequence today: the criterion's "each pair's start load is recorded" clause is unproven and two planned proof elements are missing with no recorded correction; the green/duration clauses do hold on the kept logs (20× `0 fail`, slowest head below slowest base). Repair: run the planned same-side pairs with `uptime` captured and the three-at-once counts, or record corrections the equivalence guard accepts.

### Fix 3 — criterion 6 measured wall time once per side, not user+sys over three alternating runs

Criterion 6 is a CPU comparison: three alternating solo runs per side, `/usr/bin/time` user+sys, medians and spread. The report holds one wall-clock run per side plus one re-enter. `/usr/bin/time` being absent is a real constraint, but bash's `time` builtin prints user/sys for a pipeline and needed no correction to be recorded — yet none was. Source: `implementation/proof-c6.txt` and the report deviation note. Consequence today: criterion 6's head-median-below-base-median CPU claim has no evidence. Repair: three alternating solo runs per side under user/sys timing, medians and spread recorded.

### Fix 4 — report omits the required removed-read → supplier mapping

The design's report duty names "every removed read with the quantity it proved and the earlier read that now supplies it" (Reuse 1b); the plan even lists the mapping under "Removed reads named for the report". `implementation/report.md` lists commits and check results but never records that mapping. Source: `implementation/report.md` vs design "Report duties". Consequence today: a reviewer cannot check the leaf's central lock (no read kept across a write/prompt/wait) against named evidence without redoing the census — material to verification of criterion 2. Repair: add the named mapping to the report (the plan's list can supply it verbatim where accurate).

## Nits

- N1 `adoptShell`/`inOwnScope` parameters stay optional — the read-once guarantee holds by call site, not signature; the criterion-1 assertions cover today's paths. Promoted if a new caller omits the identity.
- N2 Plan C2 text still says `pane list` == 2 where the correction and test use 3; plan-text only.

## Verdict

`fix` — proof and report duties (criteria 4, 5, 6 evidence plus the removed-read mapping) are missing or measured against the wrong thing; the product diff itself shows no defect.
