# Review A: cost-rules

Base `c9b619c6`, reviewed head `58dd949`. Verdict: **nits**.

## Evidence

- `akrogon verify` green on `58dd949` (run `be596bb2`): format/test/typecheck, `check-test-1793013480695-3855899.log`, `check-typecheck-1793013484457-3855899.log`.
- `akrogon run-check --name merged -- bun test tests/door-reset.test.ts --timeout=30000` → 37 pass / 0 fail (`check merged: 0 check-merged-1793012110339-2564573.log`).
- Diff `c9b619c6..58dd949` reviewed in full: `door-reset.ts` (+124), `peer-wait.ts` (extracted `claudeTranscript`, behavior unchanged), `SKILL.md`, `questions.md`, `shapes.md`, `tests/door-reset.test.ts`. No AREA.md named in the diff; `docs/use/plan-work.md` names no behavior this diff changes (consultant creation already requires the door to create panes; the seat-C default is a request-shape default the page does not contradict).
- Plan/design conformance: D1–D5 land in `door-reset.ts` (queue-time `statSync` boundary, `DOOR_RESET_BOUNDARY` env to the detached child, `operatorInputSeen` per-kind schemas over the post-boundary slice, `superseded` at `wait-turn-end` and `recheck`, `record unreadable` with reason, stderr refusal with no log at queue time). D6–D7 land as one `## Handover` section with both entry forms plus the pending-Destination rule; D8 lands verbatim-equal in both created-peer paragraphs; D9 lands with the conflict-goes-back rule and named-round brief in `questions.md` and the SKILL.md Take paragraph. `peer-create.ts` and `tests/fake-herdr.ts` untouched; no `learnings/` or human-doc changes.
- Tests: `Test-Change` trailers on each test commit, sources stated; input fixtures cite real session files with dates; new behavior shown red during planning (`check-plan-red`, `check-naive2/3` logs in `implementation/`, deliberate-break proofs recorded in `report.md`).
- No script parses `- mode` lines: `grep -rn 'mode' skills/chart-issues/scripts/` shows only model/usage reads, matching the design claim.

## Nits

- **N1** `## Handover`'s closing sentence says the modes "differ only in the trigger and next-chart selection, the created folder's contents and the resume entry's name." It omits the entry form and target, which do differ: autopilot appends `handed <remaining list>` to every open chart's mode record, attended appends `attended next <chart>` to the next chart only. Consequence today: none — the autopilot paragraph itself carries the correct form, so no reader following the section lands on the wrong entry. Deferred: a compressed "modes differ only" claim invites a maintainer to extend one mode assuming uniformity. Promoted to a Fix if a later change uses that sentence to skip autopilot's all-charts append.
- **N2** The missing-pi-record test uses `resolve(tmpdir(), 'pi-sess-missing.jsonl')`, a shared `/tmp` path outside the per-test `mkdtemp`. If a stale file ever existed there the refusal case silently becomes a read. Consequence today: nothing creates that path and the suite is green. Promoted to a Fix only if a real collision is observed.

## Fix findings

None.
