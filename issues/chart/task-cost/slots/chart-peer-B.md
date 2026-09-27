# Which peer exchanges should a named B keep?

## Evidence

- **F1. Rebuttals are not mostly empty in the current sample.** Under `/home/ivan/Work/infra/tamdoma/framework/issues/chart/*/slots`, I counted 12 matching `<fork>-A/-B/-merged/-rebuttal-B.md` quartets, excluding opening maps. Eleven rebuttals contain objections. Only `design-homepage-variants/slots/landing-scope-rebuttal-B.md:1` reports none. These are recorded objections, not eleven independently proven defects or a cost estimate.
- **F2. The objections concern decisions before handoff.** Framework `satellite-network-simplify/slots/quality-rebuttal-B.md:7` identifies a changed metric incorrectly attributed to all slots. `design-homepage-variants/slots/pre-selection-review-rebuttal-B.md:7-11` identifies an omitted browser requirement. `satellite-update-loop/slots/update-loop-rebuttal-B.md:5` challenges a scope-isolation guarantee. Final leaf review alone would catch these later, after dependent decisions.
- **F3. Duplicate presentation is explicitly required.** `skills/chart-issues/assets/questions.md:48` requires B's full round, while `:27` prescribes the operator-round shape. A then merges and presents another round (`SKILL.md:47`). Independent findings do not require two complete presentations.

## Options

- **O1 — recommended: retain the checkpoints, shorten B's independent return.** Keep blind opening maps and map rebuttal, independent per-fork research, one merged-round rebuttal, late-change checks and every leaf-draft review. B supplies evidence, recommendation, alternatives and unresolved risks without drafting an operator-facing round. A alone writes that round. This removes duplicated composition without withdrawing independent judgment. It revises my earlier conditional-exchange recommendation in light of F1/F2.
- **O2: keep per-fork exchanges only for consequential decisions.** Potentially saves whole peer turns, but A must predict which decisions need independent scrutiny. The sample does not establish a reliable selection rule. Retain opening and contract reviews regardless.
- **O3: keep the current process unchanged.** Lowest change risk, but retains the redundant presentation requirement in F3.

## Exact prose changes for O1

- In `skills/chart-issues/SKILL.md:47`, replace “merges the completed independent rounds” with “merges the independent findings into one operator round”. Keep its other safeguards.
- In `skills/chart-issues/assets/questions.md:27`, prepend: “The following presentation requirements apply to A's operator-facing round, not B's independent return.”
- In `skills/chart-issues/assets/questions.md:48`, replace the final sentence with: “B returns independent findings with evidence, a recommendation, viable alternatives and unresolved questions or risks. B does not draft the operator-facing round or repeat supplied intake and locks.”
- Keep `SKILL.md:35,57` and `questions.md:50` unchanged.

Pitfalls: brevity must not hide uncertainty, weaken research or omit alternatives. The [article](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/) supports reducing unnecessary output, not deleting checks regardless of downstream retries. Expected saving is duplicated output, not fewer exchanges. No savings percentage is established.
