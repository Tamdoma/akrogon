# Brief-2: SKILL.md documents the log field

## 1. Goal

`skills/watch-issues/SKILL.md:28` documents the new ` log<seat>=<path|->` field in the observe line format. Plan decision D8.

## 2. Acceptance criteria

1. The format literal shows `[ logA=<path|->]` after seat A's `[ busy=HhMMm]` and `[ logB=<path|->]` after seat B's `[ busy=HhMMm]`, inside each seat's group.
2. The surrounding text states the field appears only when that seat's herdr status is `working`, and that `-` means no usable log.
3. No other line of SKILL.md changes — the Busy rule belongs to a different leaf.

## 3. Read-first list

- `skills/watch-issues/SKILL.md` — line 28 is the only format documentation; read the Observe section
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owns: `skills/watch-issues/SKILL.md` line 28 only. Lands first: nothing. Shared test resource: none.

Current text (verbatim) at line 28:

```
`slug=<slug> phase=<phase> attempts=A<n>,B<n> blocked=<comma-list|empty> A=<pane|->/<status|->[ busy=HhMMm] B=<pane|->/<status|->[ busy=HhMMm] notified=<seats-with-busy_notified|empty>` and for `phase=failed` either ` failed=<cause>@<phase> delivery=<value|-> reason="<reason>"` or ` failed=unknown` when no failure record exists.
```

Semantics the doc must convey (from the implementation contract): for each seat, when `agent_status` is `working`, ` log<seat>=` follows that seat's optional ` busy=` suffix; its value is the seat's session-log absolute path or `-` when there is no usable log (no `agent_session`, unrecognized kind/agent, resolved file absent, or zero codex matches).

## 5. Do-not

- Do not touch any other line: not the Busy rule, not Judge, not Never. Other leaves own those.
- Do not restate resolution rules in detail; one clause covering "only when the seat's status is working; `-` means no usable log" suffices.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read lines 20–45 of SKILL.md.
2. Rewrite line 28's literal to insert both `[ log<seat>=<path|->]` groups and extend the prose clause (AC1, AC2).
3. Re-read the paragraph: the format stays one readable line, field order matches `slug phase attempts blocked A... B... notified failed...`.

Advisory size: 1 file, 1 edit, under 8 turns.

## 7. Commands

No test command applies to a doc-only change in this file. Verification: `grep -n "logA" skills/watch-issues/SKILL.md` shows the new field.

## 8. Done-when

Line 28 carries the new field and clause, nothing else changed, and the commit covers only SKILL.md. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
