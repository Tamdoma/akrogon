# Review C: long-implement leaf drafts

Disagreements only. Live file cites are from the akrogon checkout at `2b796e9`. Draft cites are relative to `handoff/long-implement/`.

## Between the two leaves

- D1. Both leaves edit one physical line, so the second merge is a certain conflict. `skills/implement-issue/worker-protocol.md:11` is a single paragraph line. wave-table owns its first sentence and proof-order owns its last clause (wave-table/design.md:20, proof-order/design.md:24). Both designs say "No ordering between the leaves; whichever merges second rebases" (wave-table/design.md:22, proof-order/design.md:25). proof-order also reuses wave-table's "shared test resource" term (proof-order/brief.md:6).
  Replacement: proof-order/state.yaml `blocked-by: [wave-table]`, proof-order/design.md "Dependencies: wave-table", and both shared-file notes say proof-order starts from wave-table's merged text.

## wave-table

- D2. Missing owned line: `skills/implement-issue/brief-template.md:21` ends "A uses these records to pick wave members and judge independence." After this leaf the plan picks wave members, so that sentence contradicts What item 1. The design lists the file as "unchanged and reused" (wave-table/design.md:21).
  Replacement: add that closing clause of `brief-template.md:21` to Owned. New text: the records carry the plan's wave values into the sub-brief, and A groups from them only when the plan has no wave table. Add it to criterion 2.
- D3. Missing owned line: `docs/guide/phases.md:77` says the final plan names "an ordered checklist". Criterion 4 requires `docs/guide/phases.md` to agree with item 1, but Owned lists only `phases.md:87` (wave-table/design.md:20).
  Replacement: add `docs/guide/phases.md:77` to Owned and to What item 4.
- D4. What item 2 misstates the rule: "A unit runs alone only when the plan or its sub-brief records a prerequisite, a shared owned path or a shared test resource" (wave-table/brief.md:6). A prerequisite moves a unit to a later wave. It does not make it run alone. Three units that all need U1 share wave 2. The binding text says only which units share a wave (wave-table/design.md:8).
  Replacement: "A unit leaves a wave only for a recorded reason: a prerequisite puts it in a later wave, and a shared owned path or shared test resource keeps it out of the wave of the unit it shares with. No other reason splits a wave."
- D5. Inline order is undefined. `skills/implement-issue/SKILL.md:44` says inline mode implements "the plan's checklist in order". A wave-grouped checklist has no order inside a wave.
  Replacement: one clause in What item 2 and criterion 2: inline mode follows wave order, then listed order inside a wave.

## proof-order

- D6. Rule 1's definition of a slow run cannot be applied, and it defeats the measured case. The brief says "A slow run is a proof plan.md sizes minutes, hours or unknown, or any live run" (proof-order/brief.md:5). Nothing requires plan.md to size proofs: the only sizing rule is in the report, `skills/implement-issue/SKILL.md:55` ("The report records wall time for every command sized minutes, hours or unknown"), and `skills/plan-issue/SKILL.md` has none. With "minutes" counted as slow, `framework:verify` (about 12m) is itself a slow run, so rule 1 does not put it before the live run. That is the exact loss in the Why (proof-order/brief.md:10).
  Replacement: "A slow run is any live run, or a proof the plan's verification sizes hours or unknown. Every `checks` command comes before the first slow run whatever its size." This drops "minutes" and ties the size word to the plan's verification section, which `skills/plan-issue/SKILL.md:55` already requires ("concrete verification").
- D7. Missing owned lines for rule 2. Two unowned sentences forbid the overlap. `worker-protocol.md:25`: "criterion proof and every `checks` command belong to A after the final worker." `skills/implement-issue/SKILL.md:54` opens "After the last implementation unit, with every worker worktree removed" (owned, but not named as needing change). Owned lists only the line 11 clause in worker-protocol (proof-order/design.md:24).
  Replacement: add `worker-protocol.md:25` to Owned and to criterion 2. Name the opening of `SKILL.md:54` in What item 2.
- D8. Rule 2 has no stated scope for passes without workers. Inline mode has no worker (`SKILL.md:46`). On the last allowed repair round "A repairs itself without a worker" (`worker-protocol.md:31`, `SKILL.md:66`). Rule 2 requires "a worker worktree" (proof-order/brief.md:6), so in those passes A can only edit the lane under a running command, which the same rule forbids.
  Replacement: add to rule 2 and criterion 2: "Overlap applies in delegated mode only and not on the final allowed repair round. There A waits for the run."
- D9. Rule 3 cannot be met as written when one tool call cannot outlast the command. The design excludes "any clock, timeout" and any named wait tool (proof-order/design.md:26). The emdash-launch polls were 170-290s long, which points to a tool limit near 300s (inferred, not confirmed). A literal reading of "waits for a slow command's actual exit" (proof-order/brief.md:7) then fails on any run over that limit.
  Replacement: "A waits on the command's exit. When a wait returns before the command has exited, A waits again. A does not sleep for a fixed interval and then read the log." Criterion 3 adds: describing the forbidden polling pattern in words is allowed, and no command name appears.

## No disagreement on
ISSUE.md, the verbatim binding text in both designs, wave-table criteria 1, 3 and 5, proof-order criteria 3 (apart from D9) and 4, and the cited line numbers (`plan-issue/SKILL.md:55`, `implement-issue/SKILL.md:44,54,66`, `skills/AREA.md:21`, `docs/guide/phases.md:87`), which match the live files. The phrase "one at a time when unsure" occurs only at `worker-protocol.md:11` and `implement-issue/SKILL.md:44` under `skills/` and `docs/`, so wave-table criterion 2 is meetable.
