# Review B: role-swap

Base: `3704d86a92d6369be36bf600ca413be79cf81c22`. Reviewed head: `7e3e30585d8cf8a9a135166f9340fd87de299116` (lane clean, 3 commits ahead of base, matches report). `debate: no`, no positions to read. Blind initial review; peer review not read.

## Findings

- F1: `src/routing.ts` matches C1 exactly: synthesis, implement, check.fix `['A']`, merge `['B']`, positions/rebuttal/review `['A','B']`, re-review `['B']`. Skills and `next` arrays untouched.
- F2: `src/next.ts` changes one gate line to `pane.B`; allocation and recovery lines unchanged. Matches C2.
- F3: `config.yaml` holds a pi/meta/muse-spark-1.3-contributor/max and b codex/gpt-6.1-sol/high; only the seat value block differs (the `b:` key -/+ pair is diff alignment). Matches C5.
- F4: All eight owned skills state the new jobs with consistent cross-refs: merge-B writes `review-B.md`, repair-A starts from it, recheck-B appends it; footers route check.fix to implement-issue A and merge to merge-issue B; watch table and AREA full-suite seat swapped. Matches C6.
- F5: Guide idea, phases, merge, cheat swapped including pass table and example slots; install uses the allowed roles-only option pointing at `config.yaml`. parts, README, `src/AREA.md` correctly unchanged (generic mentions verified by grep). Matches C7.
- F6: Tests prove C3 and C4 on observable contracts: first-pane prompt text `slot=A` with pane `panes[0]`/`pane.A` and `strong-a` start; merge to B, check.fix to A, post-repair review to B; five wrong-slot refusals with state/log unchanged; seat-A idle/exited and seat-B blocked/unknown tabs survive. Fake-herdr fakes the pre-existing herdr boundary only; prompt text is a literal command, not prose.
- F7: AREA check: one command listed all nine paths named in `skills/AREA.md`; all exist. No missing paths.
- F8: Changed behavior is documented correctly: phases table, idea pass table, merge and cheat examples match new routing; merge.md idle-close and limits.md broadcast lines are role-worded and remain true. No unchanged page makes a wrong claim.
- F9: Scope is exact: 18 changed files, all owned; Slot enum, state schema, broadcast-issue, chart-issues, observe.ts, chart-door section, slot-identity tests untouched; no `issues/` files on the branch.
- F10: Report is complete: base/head match, 339-pass suite with wall time, red/green worker evidence, e2e transcript at `implementation/e2e-transcript.md` showing the full C9 sequence with one refused call and UNCHANGED state, sweep with per-hit reasons, changed pages listed. No lesson claims to check.

Observation (no action): `console.log(db.prompts[0].text)` in `tests/next.test.ts` is pre-existing debug noise from the base commit, left in place; removing it would be out-of-scope cleanup.

## Verification evidence

- Read plan plus implementation notes, design, report, ponytail before inspecting the diff.
- Inspected the full base-to-head diff for src, config, skills, docs, and the new/changed tests.
- Ran the criterion-8 sweep: only new-mapping hits plus the four allowed exclusions; broader seat/slot grep over remaining pages shows generic mentions only.
- Confirmed reviewed head equals report head with empty `git status`; no code changed since the report's green full run, so no check rerun per the rerun rule.

## Verdict

ready
