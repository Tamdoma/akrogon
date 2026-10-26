# Fork notes, seat A, carry-rules, 2026-10-26

## Q1 record or prompt
- Pick: Mode record handover entry naming the outgoing mode, matched by fresh A; no match starts attended in no chart. Reason: fresh attended A still pulls, restarts consultants and writes chart files on entry, so a stale prompt can act in the wrong chart; one shared mechanism for both modes. Cost: Mode record stops being autopilot-only (shapes.md text), attended charts gain the section.
- Rejected: prompt only; nothing on disk to check, and my "no authority" reason was wrong (B,C rebuttals).
- Evidence: better-than-training, SKILL.md Autopilot handover paragraph and shapes.md Chart records, 2026-10-26; live autopilot handovers 2026-10-22 (config-walls, orphan-pane CHART.md).
- Pitfall: the autopilot resume must stay distinct; removed by the entry naming the mode and only an autopilot entry permitting `continue autopilot`.

## Q2 instructions
- Pick: written into the next chart's records before the reset (CHART.md, a `carry:` line in the Mode record handover entry or INTAKE.md Source for operator words), prompt points at it. Operator words stay verbatim. Approvals are referenced to their existing records, never restated.
- Rejected: prompt only (wiped with the pane, not durable); reference only (session instructions have no file).
- Pitfall: carrying everything restores the cost; removed by carrying only instructions that bind later charts.

## Q3 turn gap
- Pick: accept and document. Old A's last turn ends with the footer; the child polls every 500 ms and fires on the first ended turn, so the gap is the poll window plus any operator turn typed before the child sees the end. A guard needs turn identity per kind (claude transcript, codex rollout, pi hook), which the script reads already but would need a new marker contract.
- Rejected: script change; new machinery for a narrow window, outside the approved scope.
- Pitfall: an operator instruction typed in the gap is lost; removed by the footer telling the operator the handover is queued and to speak to the fresh A.

## Q4 floor
- Pick: none; reset at every switch. A floor adds a judgment rule and the measurement after three charts decides.
- Rejected: skip on revisit or short charts; new rule without data.

## Q5 conflicting corrections
- Pick: conflict goes back to the operator as a question (under autopilot A's recorded pick) before the check; A only resolves wording.
- Rejected: A resolves substance silently; research and checks never supply the operator's answer (questions.md).
