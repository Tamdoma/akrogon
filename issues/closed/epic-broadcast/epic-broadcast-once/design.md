# Design: epic-broadcast-once

## Binding decisions, verbatim

### Completion line (issues/chart/epic-broadcast-once/forks/completion-line.md)
Q1. When a completion owner finishes, what line does `akrogon phase <slug> merged` print for the merge slot to trigger the broadcast?

Operator 2026-09-30: `1a`

Reason: the printed word always matches what finished (issue or epic), so no one later reads an epic as an issue. Chosen after the plain restatement where both options send identical broadcasts.

Foreclosed: 1b, a single `issue complete <owner>` line that names epics as issues.

Result: standalone issue completion prints `issue complete <issue>` (unchanged). Epic completion prints `epic complete <epic>` once. An issue finishing inside an unfinished epic prints no completion line. The merge slot broadcasts on either line.

### Intake rule (Tamdoma/akrogon#42)
Issues without an epic: broadcast when the issue completes (current behavior). Issues inside an epic: no broadcast until every leaf in the whole epic is merged, then one broadcast covering the epic.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Auth, secrets and backend mutation lines do not apply: no auth, secret or data path changes.
- No vanity tests; negative and edge cases are mandatory: the inner-issue-silent case, concurrent final merges, recovery silence and repeated `merged` are the negatives.
- User-visible flow: the flow is the CLI's printed line, proven by real `akrogon phase` invocations in the existing `tests/phase.test.ts` fixture harness (the `cli(...)` helper). No browser, no Playwright.
- Cheapest sufficient test: extend the existing completion and source-closure tests rather than adding a new harness. No live Discord or GitHub call is needed; the sender and `gh` stub are unchanged.
- No chain trigger and no slow or live run.

## Leaf architecture

Owned surfaces:
- `src/phase.ts` `completeOwner`: replace the `if (justMerged) console.log(`issue complete ...`)` before the completion guard with a print that happens only when `complete` is true and `justMerged` is true: `issue complete <basename(owner)>` when `owner === issue`, else `epic complete <basename(owner)>`. Source closure order and the folder move stay as they are.
- `tests/phase.test.ts`: update expectations at the completion test (~169-191) and the source-closure test (~566-650) to the new rule; add the negative assertions from done-criteria 1, 2 and 4.
- `skills/merge-issue/SKILL.md` lines 3 and 47, `skills/broadcast-issue/SKILL.md` lines 3, 10 and 14, `docs/guide/merge.md` (completion output example ~19-23, broadcast section ~36, broadcast-issue section ~69), `docs/guide/cheat.md:125`, `docs/guide/idea.md:89`, `README.md:188`: wording only.

Interfaces: stdout lines `issue complete <issue>` and `epic complete <epic>`, each alone on its line; consumed only by the merge-issue skill.

Exclusions:
- GitHub source closure timing and `closeSources` behavior.
- Discord sender script, retry and delivery records.
- The `justMerged` parameter and recovery callers `src/phase.ts:282`, `src/next.ts:521` stay as they are.
- Nothing under `issues/`.

Dependencies: none. No external operation changes, so no operation proof is required. No credentials needed.
