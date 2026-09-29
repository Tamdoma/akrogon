# unreadable-capacity

## Question
Q1. When a repo has an unreadable entry, what capacity does each readable leaf and each unreadable entry reserve? Today every readable non-failed leaf, merged included, plus one per unreadable (src/next.ts:273-274).
Q2. Should `akrogon phase` and `akrogon status <slug>` keep refusing when any leaf in the repo is unreadable (`findLeaf` -> `allLeaves`, src/state.ts:104-135)?

### Carries
- archive-boundary taken 2026-09-28: charts no longer move into issues/closed, so chart drafts cannot become unreadable entries. Remaining unreadable sources: a real leaf with malformed state.yaml, a state.yaml at a bad depth under open/closed, each path of a duplicate slug. Correction (B): foreign leaves are not unreadable and reserve zero (src/next.ts:99-104,130-143).
- Prior decision: issues/closed/loop-hardening/chart/forks/dispatch-error-report.md:13 (operator 2026-09-11 "whatever you want to do", A chose) "A repo with any unreadable leaf counts all its leaves as active for capacity." d058236 later excluded failed leaves.

## Findings
Tier better-than-training: inspected repo code, tests and the loop-hardening chart, 2026-09-28. No outside source applies (A,B).
- Merged round: slots/unreadable-capacity-merged.md. B round: slots/unreadable-capacity-B.md. Rebuttal: slots/unreadable-capacity-rebuttal-B.md.
- Q1 recommend normal activity count for readable leaves plus one per unreadable (A,B). Supersedes dispatch-error-report.md:13.
- Q2 recommend keep refusing (A). Rebuttal B accepted: path context in the error depends on the failure kind (malformed YAML and duplicate slug errors omit the path, src/state.ts:71-79,111).

## Taken
Operator 2026-09-29, verbatim: `1a | 2a |`

Q1 1a: with an unreadable entry, a repo contributes readable leaves by the normal rule (not merged, not failed, live pane in recorded tab or worktree) plus one per unreadable entry. Unknown-population holds and foreign exclusion unchanged. Supersedes issues/closed/loop-hardening/chart/forks/dispatch-error-report.md:13. Reason: a broken neighbor gives no reason to discard known state. Foreclosed: 1b merged-only exclusion, 1c zero reservation.
Q2 2a: `findLeaf`/`allLeaves` keep refusing on any unreadable leaf, so `akrogon phase` and `akrogon status <slug>` stay strict. Reason: an unreadable file may hold the target slug. Foreclosed: 2b skip-and-continue.
