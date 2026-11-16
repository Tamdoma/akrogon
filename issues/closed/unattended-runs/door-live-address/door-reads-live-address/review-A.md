# Review A: door-reads-live-address

Base 8532a1f7, reviewed head f7748167 (single commit `docs: define the door's address as the live HC_TERMINAL_ID read`). Text-only leaf; judged by reading the three changed files against the brief criteria, plan D1–D6 and design exclusions.

## Criterion check

1. `## Open` now states: door's address = `$HC_TERMINAL_ID` read at the moment of each use; recorded address in summary/`seats.yaml`/Mode record is history, never routing; A resolves and writes the literal, never the variable name; the definition binds every rule in the three files, enumerating the column-helper calls (`--save`, `--restart`), brief report steps, `transcript.ts` lookup, Mode/seat entries, door-reset.ts argument and handover start prompt. Matches criterion 1 and locked answer Q1 verbatim in substance.
2. Every address-use site in the three files is bound: `<door address>` placeholders in `## Open`/`## Handover` take the definition's referent ("uses it"); questions.md's report step and handover.md's `door-reset.ts <A address>` each name the live source explicitly; `## Handover`'s start-prompt check now reads "the live address it reads per the `## Open` door-address definition". No rule in the three files names a summary, `seats.yaml` or the Mode record as the address source — the candidate listing at head shows only the definition and legitimate record writes (SKILL.md:29, :39, handover.md:5).
3. The not-in-a-tab rule keeps `recorded once in the round's log and the round continues` and adds `when the helper was called with the live address`. Criterion 3 met.

## Verification evidence

- `akrogon verify` on f7748167: green (format, 1183 tests, typecheck) — receipt `implementation/check-test-1794844438467-476971.log`.
- Criterion probes green at head: c1-definition, c2-use-sites, c3-not-in-tab (logs in `implementation/check-*-17948443{6,7}*.log`); base reds recorded in plan.md.

## Docs and AREA.md

- No `AREA.md` in the diff. `skills/AREA.md` names the skill's sections only and stays accurate; `docs/` and other AREA files have no door-address mention (verified by grep at planning).
- Not owned and unchanged, as designed: `scripts/door-reset.ts`, herdr-setup's helper, `autopilot.md`, `shapes.md`, `direct-route.md`. `autopilot.md:23`'s seats.yaml address read is a history comparison (detect another door), consistent with "recorded is history", not a source for routing.
- `direct-route.md`'s `hc send <door address>` in the B review prompt is outside the three owned files and outside the definition's enumerated binding (the locked design names the same three files); recorded in plan D6/report as a limitation. The `<door address>` placeholder there still resolves through the `## Open` definition in practice. Not a defect; if review wants it named, that is scope beyond the locked design.

## Findings

None. No Fix, no Nit worth recording. Semantics check on the two dense edits: `## Handover`'s "the live address it reads" resolves "it" to the receiving session (A's own `HC_TERMINAL_ID`), which is the correct comparison target for the start prompt's literal; handover.md's `unset or different` for the helper terminal's `HC_TERMINAL_ID` is accurate — `hc run` gives the helper its own terminal ID.

## Verdict

`ready`.
