# Review A: signposts-step

Base: `19998b35` (AKROGON_BASE). Reviewed head: `d6bb6429495080f6574d7c7ce665f95e9d54a62c` — one commit, 8 files, +50/−17, prose only.

## Evidence

- `akrogon verify` on the reviewed head: `verify leaf d6bb6429...: green` (format, test, typecheck).
- Criterion proofs from `implementation/report.md`, all green on this head: `check signposts-struct-green: 0` (structural anchors), `check signposts-probe: 0` (`akrogon status --charts` counts `## Taken` 1/2 vs 0/2), `check test: 0` (1309 pass), `check signposts-owned: 0` (diff is exactly the eight owned files).
- Read every changed section in Open → Drain → Take → Autopilot → Handover order plus questions.md, shapes.md and the five docs, checked against the plan's decisions and the brief's nine criteria. Checked adjacent consumers: preflight's fork-answer refusal (an unanswered manual signposts file keeps `## Taken` empty → handoff correctly refuses), `src/status.ts` `chartRow`, consultant-restart wording, `docs/reference/where-things-go.md`, README, `docs/pictures/*.svg`.

## Findings

No Fixes. All nine criteria are carried by the diff: Open places the round after intake import and the consultant restart before any map with the angle exchange first; the session and three modes are defined with the ambiguous-words ask; autopilot's presented round, full-autopilot echo/`signposts: A`/never-drop and the signposts-first pick rule; the handover entry carries the signposts path and the next-chart folder the verbatim copy; questions.md names the light exception and per-mode unanswered rules; shapes.md holds the record, copies, corrections, dropped list and the `signposts:` Autopilot line; Drain takes the signposts order and skips dropped charts/seeds; the five docs tell one procedure. `bun test` green; `src/`, `tests/`, `issues/` untouched.

### Nits

- N1 — `SKILL.md` Open's reuse-offer sentence says "the operator answers 'same' or changes" while under full autopilot A answers the signposts. Reproduction: a real full-autopilot door following Open literally could present the offer and wait. Deferred because the Autopilot section's explicit "A answers both" overrides and no door has misbehaved; promoted to a Fix by a door observed waiting on the operator under full autopilot because of this line. Inherited from the design's own wording (rule 11 says "the operator answers 'same' or changes").
- N2 — `shapes.md`'s copy rule does not say what happens to a resumed chart's earlier verbatim copy when a later door run sets new signposts. The Autopilot section already rules the new run's signposts govern ("never a chart folder's earlier ones"), so the stale copy is superseded textually but physically remains. Deferred: inherited design gap, consequence is a misleading file, not wrong behavior; promoted if a door is observed acting on a stale copy.
- N3 — `SKILL.md`'s handover template reads `signposts <path>` while `shapes.md` reads `signposts <path or none>`; a session opened before the rule lands has no signposts file, so the SKILL.md form is unsatisfiable in that documented case. Deferred: shapes.md's `or none` resolves the documented format and the SKILL.md prose reads as naming the field; promoted if a door omits or invents the value.

### Doc check

Documented behavior changed only where the leaf intends it; no dead pointers found (`words.md` links `#set-the-signposts`, which exists in `plan-work.md`; `docs-links.test.ts` is inside the green `bun test`). `docs/use/autopilot.md`'s "waits for your one answer" is loose next to "presented round, not a wait" but conveys the correct behavior to a reader — not recorded.

## Verdict

`nits`
