# Review A: reset-name-restore

Base `d44920b8`, reviewed head `7071124e` (tree `9e02b066` — identical to `d31c696c`, the head `akrogon verify` ran green on; the only delta is the `Test-Change:` trailer line). Blind review; B's file not read.

## Evidence used

- `implementation/report.md`, `plan.md`, `brief.md`, `design.md`, diff `d44920b8..7071124e` (script, handover.md, tests/AREA.md) plus the plan-time commit `790e1050` (tests + stand-in).
- `check door-reset-suite: 0 implementation/check-door-reset-suite-1794651857905-2818098.log` — 16/16 green on the implementation tree, covering every criterion test by name.
- `check-test-1794651924184-2821111.log` — `akrogon verify` green (format + 1183 tests + typecheck).
- Deliberate-break reds recorded at plan synthesis: `check c2-break-nowait` (reset without the rename wait → red), `check c1-break-ownname` (own-name branch off → red), `check c5-break-order` (stage before input-check → red), `check c4-bound-base` and `check c-suite-base2` (missing-behavior reds).

## Judgment vs criteria

- C1 kept: last `custom-title` `customTitle` over the whole pre transcript via schema parse; kept logs the name; no input sent. Test asserts all three plus last-of-several. Correct.
- C2 sent: tab lookup via `docGet` at that moment against `space.space.id`; verbatim `/rename <name>` send; wait `idle && t.turn > sent.turn` correctly guards the pre-rename snapshot (send answers the counter before the turn completes — charting P6 and the green test confirm). New transcript read by the test, not the log. Correct.
- C3 skips: exactly the three locked reasons, all before any send; blank `customTitle` counts as none (locked C correction); non-claude never touches `docGet`. Correct.
- C4 bound: `turn open` / `identity changed` stops type nothing more; thrown errors propagate to the log and non-zero exit (no catch). Correct.
- C5 cancel: stage sits after `input-check`; superseded still exits before any name work — break run D proved the ordering is guarded by the test.
- C6 docs: handover.md paragraph carries all seven required statements verbatim-consistent with the log strings.
- Scope: no seats.yaml, no transcript writes, no other-harness naming, nothing under `issues/`, no stored state — matches the design's exclusions.
- Report accuracy: verified; the head/base, the plan-correction note (checklist unit split collapsed to one serial-solo unit — no locked decision touched), commands and limitation lines all match the artifacts.
- AREA/docs: `tests/AREA.md` line updated and its named paths exist; no other agent or human doc names these internals (`skills/chart-issues/SKILL.md` links handover.md without enumerating stages). No documented behavior elsewhere changed.

## Findings

### Nits

1. **Trailing-whitespace tab name sent verbatim.** A tab name like `c-akrogon ` passes `trim() !== ''` and is sent with its space, so claude may record a name that differs from the operator-intended one (and the logged `sent` name). Deferred: consequence is cosmetic, no criterion names it, and stripping would silently change a real name whose trailing space is intentional. Promotes to a Fix if an operator actually produces such a tab name and the drift is observed.
2. **`name: sent` log line lacks the turn number.** `wait-turn-end` logs `turn`, `sent` does not; a handover log reader cannot correlate the rename to an hc turn count. Deferred: the transcript/inputs already carry the fact and no consumer parses the log beyond failure reasons.

### Operator actions

None. No grants, no covered launches, nothing paid or live in the leaf.

## Verdict

`nits`
