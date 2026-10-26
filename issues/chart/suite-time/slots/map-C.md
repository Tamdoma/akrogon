# Map C: akrogon inefficiency candidates

Window: timings.jsonl 2026-10-12→25 (8,085 events), verify-runs.jsonl 251 completed runs, merge-attempts.jsonl 91 attempts, log.jsonl 219 leaves.

## Candidates

### C1 (PICK): `test` sits in `checks` — move it to `merge_checks`
- Waste: the whole `bun test` suite (69 files, ~35.6k lines, ~2-9 min observed, 1135 tests) runs at leaf scope: 397 leaf-scope `test` runs = 914.7 min, plus verify leaf-scope 190 runs = 548 min wall. Median 4 full-suite runs per leaf (mean 6.6, max 45 on `scratch-copy-removal`).
- Measurement: timings.jsonl `check_end` where `name=test, scope=leaf` (n=397, sum duration_ms = 54,880s); verify-runs.jsonl wall (end−start) by scope = 548 min leaf / 179 min merge; run counts per slug.
- Expected gain: after the move, the suite runs once per merge attempt on the rebased tree (still fully gating landing — merge verify covers `checks`+`merge_checks`). Leaf-scope suite compute ~1,295 min/11d → ~0; merge scope stays ~180–300 min. ≈75% cut in check compute, ≈30–50% cut in check-attributable leaf wall; every seat-minute spent inside verify shrinks equally (verify runs inside seat turns).
- Basis for ≥20%: check-attributable compute is ~1,640 min/11d; removing ~1,100–1,300 min of leaf-scope suite runs beats 20% on cost and speed. Quality of landed code is unchanged (same suite, rebased tree, before push).
- Size: `issues/config.yaml` move one key (`test:` from `checks:` to `merge_checks:`); 1–3 doc/skill lines. <10 lines.
- Breaks/invites: first suite signal moves from implement-gate to merge. verify leaf `test` reds: 39/190 (20%) — some become red merges, each costing a check.fix pass (~15–30 min). Net still positive; monitor merge red rate (baseline 4 red + 1 held / 91 = 5.5%). `requireGreenReceipt`, known-red covers, `merge_covers` and the run-check `merge_checks` refusal all adapt to config by construction. init-akrogon SKILL already prescribes "slow full-suite commands in merge_checks" — the repo's own config violates its own guidance.

### C2: Sequential duplicate `akrogon verify` on identical leaf+tree — 128 min wasted
- 36 runs across 28 (leaf,tree) pairs ran fully although the prior run completed green first (0 `reused:` entries in 753 command records). E.g. `state-home` tree 322dde98: identical all-green runs 4 min apart.
- Cause found: per-command/whole-run reuse (`greenRun`/`reuseSource`) only shipped 2026-10-25 in 6a054950 + 9aaed138 — all observed dups predate it. Already fixed; worth one sentence confirming reuse actually fires in the next days' data (risk: an unseen predicate still misses).

### C3: Load-flaked subprocess tests — timeout bumps in fixture-heavy files
- 157 red-records; failing logs show batch-dispatch.test.ts tests dying at their own 15–30s per-test limits under host load ~130–175 (provenance text). 18/132 leaf test fails were timeout-only; median leaf test start sees 9 concurrent runs (max 26). `akrogon flaky`: 19 units.
- Gain: removes ~15–20% of leaf test reds plus their reruns and occasional repair rounds (fix_rounds hist: 218 leaves hit ≥1 repair round); est. 200–400 min/2wk. Safer than C1 (no defect deferral) but smaller and it masks slowdown rather than removing it.
- Size: bump explicit `}, 15000)` style timeouts in tests/batch-dispatch.test.ts and 2–3 similar files. ~20 lines.

### C4: `bun test --bail` in the `test` check — rejected
- Saves ~10–20% suite compute but destroys the full failure list that seats need for fix attribution and that `verify --known-red` needs for name-level cover. Quality-negative.

### C5: Per-name run permit for `test` (cap concurrency) — rejected
- Re-implements the dropped run-permit: closed/host-test-load built it, closed/concurrent-checks/memory-start-check removed it, admission memory read dropped 2026-10-14. Serializing a 2–4 min suite against median-4/leaf demand adds queue wait that exceeds the flake savings.

### C6: Prettier red runs — rejected
- 66 leaf `format` fails but each ~2.3s and mostly implement-phase seat iterations already fixed in place. Below the bar.

## Pick

**C1**, for largest measured waste per line changed: one config key moves ~1,100+ min/11d of suite compute out of the leaf stage while merge verify keeps identical landing quality.

Proof after landing, against the named baseline (timings.jsonl + verify-runs.jsonl, trailing window):
- leaf-scope `test` `check_end` runs/leaf → ~0 (baseline median 4); verify leaf-scope `test` runs → ~0 (baseline 190 in 11d).
- `akrogon timing --cohort` check minutes per leaf drops ≥20% vs the same readout pre-change.
- Guardrail: merge-attempts red rate stays <30% (baseline 5.5%); if it breaches, the deferral cost outweighs the saving and the key moves back.

## Evidence lines
- T1 issues/timings.jsonl (2026-10-12→25): leaf `test` n=397 / 914.7 min / 132 fails; leaf `format` n=321 / 12.4 min / 66 fails; `base:test` 55.7 min once; median 4 suite runs/leaf.
- T1 issues/verify-runs.jsonl: 251 runs, leaf 548 min, merge 179 min; 36 sequential same-tree dup runs = 128 min; 0/753 reused (pre-fix).
- T1 issues/merge-attempts.jsonl: 91 attempts, 86 merged, 4 red, 1 held.
- T1 issues/red-records.jsonl: 157 opened; sample logs show batch-dispatch timeouts at 15–30s limits; flake provenance cites load ~130–175.
- T1 issues/log.jsonl: fix_rounds {1:218, 2:55, 3:30, 4+:23}; merge→check.fix 14 transitions.
- T2 issues/config.yaml: `test: bun test --timeout=30000` under `checks:`, `merge_checks` empty.
- T2 src/verify.ts: `verifyCommands` scope split, `greenRun`/`reuseSource` (landed 2026-10-25), `requireGreenReceipt`.
- T2 skills/init-akrogon/SKILL.md: "slow full-suite commands in merge_checks".
- T2 closed leaf briefs: host-test-load/run-permit (serialization built then removed).
- T3 computations: concurrency sweep over check_start/end events (median 5, max 26 active runs at test start); per-leaf run counts; dup-tree grouping.

## Pitfalls and what removes each
- P1 More red merges. Removed by: merge verify still runs the suite on the rebased tree before push; check.fix's narrowest-reproducing-command rule already exists; guardrail metric named above.
- P2 Seats keep ad-hoc full-suite `bun test` during implement (397 runs include ~207 non-verify seat runs). Removed by: implement-issue already mandates targeted worker proofs; one skill line can point seats away from whole-suite habit if data shows it persists.
- P3 C1's claim weakens if leaf verify reds were mostly flake (they'd cost nothing real). Counter: 39/190 verify-leaf test reds include real defects; either way the compute save stands.
- P4 Reuse may still miss (C2 fix is a day old). Removed by: watch `reused:` entries next week; if still 0, that is a second leaf.

## Questions for the operator
- Q1 Is deferring the first whole-suite signal to the merge turn acceptable, given nothing lands ungreen and a red merge already has a defined repair path? This is C1's only real trade.
- Q2 If you want zero defect-deferral, C3 (timeout bumps) is the safer pick at roughly a quarter of the saving — preference?
